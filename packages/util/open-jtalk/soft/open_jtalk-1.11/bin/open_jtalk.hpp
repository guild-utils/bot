#include "mecab.h"
#include "njd.h"
#include "jpcommon.h"
#include "HTS_engine.h"

typedef struct _Open_JTalk
{
  Mecab mecab;
  NJD njd;
  JPCommon jpcommon;
  HTS_Engine engine;
} Open_JTalk;

class TTS
{
private:
  Open_JTalk open_jtalk;
  static const constexpr int MAXBUFLEN = 1024;

public:
  TTS();
  int synthesis(const char *txt, const char *oggfn, FILE *opusfp, FILE *wavfp,
                FILE *logfp);
  void clear();

  int load(char *dn_mecab, char *fn_voice);

  inline void set_alpha(double f)
  {
    HTS_Engine_set_alpha(&open_jtalk.engine, f);
  }

  inline void set_speed(double f)
  {
    HTS_Engine_set_speed(&open_jtalk.engine, f);
  }

  inline void add_half_tone(double f)
  {
    HTS_Engine_add_half_tone(&open_jtalk.engine, f);
  }

  inline void set_msd_threshold(size_t i, double f)
  {
    HTS_Engine_set_msd_threshold(&open_jtalk.engine, i, f);
  }

  inline void set_gv_weight(size_t i, double f)
  {
    HTS_Engine_set_gv_weight(&open_jtalk.engine, i, f);
  }

  inline void set_volume(double f)
  {
    HTS_Engine_set_volume(&open_jtalk.engine, f);
  }
  ~TTS(){
    clear();
  }
};