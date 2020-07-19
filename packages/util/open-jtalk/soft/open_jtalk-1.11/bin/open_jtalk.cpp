#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <math.h>
#include <unistd.h>
#include <sys/epoll.h>
#include <fcntl.h>
#include <errno.h>
#include "open_jtalk.hpp"
/* Main headers */
#include "mecab.h"
#include "njd.h"
#include "jpcommon.h"
#include "HTS_engine.h"

/* Sub headers */
#include "text2mecab.h"
#include "mecab2njd.h"
#include "njd_set_pronunciation.h"
#include "njd_set_digit.h"
#include "njd_set_accent_phrase.h"
#include "njd_set_accent_type.h"
#include "njd_set_unvoiced_vowel.h"
#include "njd_set_long_vowel.h"
#include "njd2jpcommon.h"

#include "../../sound-mixing-proto/index.pb.h"
#include "../../sound-mixing-proto/index.grpc.pb.h"
#include <grpcpp/grpcpp.h>
#include <condition_variable>
#include <opus.h>
TTS::TTS()
{
   Mecab_initialize(&open_jtalk.mecab);
   NJD_initialize(&open_jtalk.njd);
   JPCommon_initialize(&open_jtalk.jpcommon);
   HTS_Engine_initialize(&open_jtalk.engine);
}

int TTS::synthesis(const char *txt, const char *oggfn, FILE *opusfp, FILE *wavfp,
                   FILE *logfp)
{
   int result = 0;
   char buff[MAXBUFLEN];

   text2mecab(buff, txt);
   Mecab_analysis(&open_jtalk.mecab, buff);
   mecab2njd(&open_jtalk.njd, Mecab_get_feature(&open_jtalk.mecab),
             Mecab_get_size(&open_jtalk.mecab));
   njd_set_pronunciation(&open_jtalk.njd);
   njd_set_digit(&open_jtalk.njd);
   njd_set_accent_phrase(&open_jtalk.njd);
   njd_set_accent_type(&open_jtalk.njd);
   njd_set_unvoiced_vowel(&open_jtalk.njd);
   njd_set_long_vowel(&open_jtalk.njd);
   njd2jpcommon(&open_jtalk.jpcommon, &open_jtalk.njd);
   JPCommon_make_label(&open_jtalk.jpcommon);
   if (JPCommon_get_label_size(&open_jtalk.jpcommon) > 2)
   {
      if (HTS_Engine_synthesize_from_strings(&open_jtalk.engine, JPCommon_get_label_feature(&open_jtalk.jpcommon),
                                             JPCommon_get_label_size(&open_jtalk.jpcommon)) == TRUE)
      {
         result = 1;
      }
      if (wavfp != NULL)
      {
         HTS_Engine_save_riff(&open_jtalk.engine, wavfp);
      }
      if (oggfn != NULL)
      {
         HTS_Engine_save_ogg(&open_jtalk.engine, oggfn);
      }
      if (opusfp != NULL)
      {
         HTS_Engine_save_opus(&open_jtalk.engine, opusfp);
      }
      if (logfp != NULL)
      {
         fprintf(logfp, "[Text analysis result]\n");
         NJD_fprint(&open_jtalk.njd, logfp);
         fprintf(logfp, "\n[Output label]\n");
         HTS_Engine_save_label(&open_jtalk.engine, logfp);
         fprintf(logfp, "\n");
         HTS_Engine_save_information(&open_jtalk.engine, logfp);
      }
      HTS_Engine_refresh(&open_jtalk.engine);
   }
   JPCommon_refresh(&open_jtalk.jpcommon);
   NJD_refresh(&open_jtalk.njd);
   Mecab_refresh(&open_jtalk.mecab);

   return result;
}
void TTS::clear()
{
   Mecab_clear(&open_jtalk.mecab);
   NJD_clear(&open_jtalk.njd);
   JPCommon_clear(&open_jtalk.jpcommon);
   HTS_Engine_clear(&open_jtalk.engine);
}
int TTS::load(char *dn_mecab, char *fn_voice)
{

   {
      if (Mecab_load(&open_jtalk.mecab, dn_mecab) != TRUE)
      {
         clear();
         return 0;
      }
      if (HTS_Engine_load(&open_jtalk.engine, &fn_voice, 1) != TRUE)
      {
         clear();
         return 0;
      }
      if (strcmp(HTS_Engine_get_fullcontext_label_format(&open_jtalk.engine), "HTS_TTS_JPN") != 0)
      {
         clear();
         return 0;
      }
      return 1;
   }
}
int verifyEncode(unsigned char * cbits,int nbBytes){
      int err;

      OpusDecoder *decoder = opus_decoder_create(48000, 1, &err);
      short out[6*960];
      int frame_size = opus_decode(decoder, cbits, nbBytes, out, 6*960, 0);
      if (frame_size<0)
      {
         fprintf(stderr, "decoder failed2: %s\n", opus_strerror(frame_size));
         return FALSE;
      }
      return TRUE;
}
//fd is pipe etc
static bool FdToWriter(int fd, ::grpc::ServerWriter<::ChunkedData> *writer)
{
   static const constexpr int BUFLEN = 4096;
   char buf[BUFLEN];
   int size;

   do
   {
      errno = 0;
      size = read(fd, buf, BUFLEN);
      if (size < 0)
      {
         if (errno == EAGAIN || errno == EWOULDBLOCK)
         {
            errno = 0;
            break;
         }
         fprintf(stderr, "read error!%s!\n", strerror(errno));
         return true;
      }
      fprintf(stderr,"readed %d bytes!\n", size);
      if (size == 0)
      {
         return true;
      }
      ChunkedData data;
      verifyEncode(reinterpret_cast<unsigned char*>(buf),size);
      std::string str(buf, size);
      data.set_data(str);
      
      if (!writer->Write(data))
      {
         fprintf(stderr, "writer#Write Failed!\n");
         return true;
      }

   } while (size >= BUFLEN);
   return false;
}
static void setnonblocking(int sock)
{
   int flag = fcntl(sock, F_GETFL, 0);
   fcntl(sock, F_SETFL, flag | O_NONBLOCK);
}
struct FdAndWriter
{
   int fd;
   ::grpc::ServerWriter<::ChunkedData> *writer;
   std::condition_variable cond;
   std::mutex mtx;
   bool exiting;
};
class ServiceImpl final : public Mixer::Service
{
private:
   int _epoll_fd;

public:
   ServiceImpl(int epoll_fd) : _epoll_fd(epoll_fd)
   {
   }
   ::grpc::Status mixing(::grpc::ServerContext *context, const ::RequestVoiceMixing *request, ::grpc::ServerWriter<::ChunkedData> *writer) override
   {

      /* dictionary directory */
      char *dn_dict = std::getenv("OPEN_JTALK_DIC");

      /* HTS voice */
      char *fn_voice = "/htsvoice/hts_voice_nitech_jp_atr503_m001-1.05/nitech_jp_atr503_m001.htsvoice";

      /* input text file name */
      FILE *txtfp = stdin;
      char *txtfn = NULL;

      /* output file pointers */
      FILE *wavfp = NULL;
      int opusfd[2];
      if (pipe2(opusfd,O_DIRECT) == -1)
      {
         perror("pipe");
         return ::grpc::Status::CANCELLED;
      }

      FILE *opusfp = fdopen(opusfd[1], "w");
      setvbuf(opusfp, NULL, _IONBF, 0);
      const char *oggfn = NULL;
      FILE *logfp = NULL;
      TTS tts;

      if (tts.load(dn_dict, fn_voice) != TRUE)
      {
         fprintf(stderr, "Error: Dictionary or HTS voice cannot be loaded.\n");
         tts.clear();
      }

      tts.set_speed(request->speed());
      tts.set_volume(request->volume());
      tts.add_half_tone(request->tone());
      tts.set_msd_threshold(1, request->threshold());
      if (request->allpass() >= 0)
      {
         tts.set_alpha(request->allpass());
      }
      tts.set_gv_weight(1, request->intone());
      struct epoll_event ev;
      ev.events = EPOLLIN;
      setnonblocking(opusfd[0]);
      FdAndWriter *ptr = new FdAndWriter{opusfd[0], writer};
      ev.data.ptr = ptr;
      if (epoll_ctl(_epoll_fd, EPOLL_CTL_ADD, ptr->fd, &ev) == -1)
      {
         perror("epoll_ctl: opusfp");
         return ::grpc::Status::CANCELLED;
      }
      writer->SendInitialMetadata();
      auto text = request->text().c_str();
      if (tts.synthesis(text, oggfn, opusfp, wavfp, logfp) != TRUE)
      {
         fprintf(stderr, "Error: waveform cannot be synthesized.\n");
         tts.clear();
         return ::grpc::Status::CANCELLED;
      }

      /* free memory */
      tts.clear();

      /* close files */
      if (txtfn != NULL)
         fclose(txtfp);
      if (wavfp != NULL)
         fclose(wavfp);
      if (logfp != NULL)
         fclose(logfp);
      if (opusfp != NULL)
         fclose(opusfp);
      std::unique_lock<std::mutex> lk(ptr->mtx);
      ptr->cond.wait(lk, [ptr] { return ptr->exiting; });
      delete ptr;
      return ::grpc::Status::OK;
   }
};
class Main
{
   static const constexpr int MAX_EVENTS = 10;

public:
   void run()
   {
      auto epollfd = epoll_create1(0);
      if (epollfd == -1)
      {
         perror("epoll_create1");
         exit(EXIT_FAILURE);
      }
      std::string server_address("0.0.0.0:50051");
      ServiceImpl service(epollfd);
      grpc_impl::ServerBuilder builder;
      builder.AddListeningPort(server_address, grpc::InsecureServerCredentials());
      builder.RegisterService(&service);
      std::unique_ptr<grpc_impl::Server> server(builder.BuildAndStart());
      std::cout << "Server listening on " << server_address << std::endl;

      struct epoll_event events[MAX_EVENTS];
      for (;;)
      {
         int nfds = epoll_wait(epollfd, events, MAX_EVENTS, -1);
         fprintf(stderr, "epoll_wake!\n");

         if (nfds == -1)
         {
            perror("epoll_pwait");
         }

         for (int n = 0; n < nfds; ++n)
         {
            FdAndWriter *ptr = reinterpret_cast<FdAndWriter *>(events[n].data.ptr);
            printf("%d/%d\n", n, nfds);
            if (FdToWriter(ptr->fd, ptr->writer))
            {
               fprintf(stderr, "closing!\n");
               epoll_ctl(epollfd, EPOLL_CTL_DEL, ptr->fd, NULL);
               close(ptr->fd);
               {
                  std::lock_guard<std::mutex> lock(ptr->mtx);
                  ptr->exiting = true;
               }
               ptr->cond.notify_all();
            }
         }
      }
      server->Wait();
   }
};
int main()
{
   Main m;
   m.run();
}