//
// Created by Arseny Tolmachev on 2017/03/09.
//
#include <fstream>
#ifdef _WIN32
#include <nowide/iostream.hpp>
#include <nowide/fstream.hpp>
#include <nowide/args.hpp>
#else
#include <iostream>
#endif
#include "jumanpp.h"
#include "core/input/pex_stream_reader.h"
#include "jumandic/shared/jumanpp_args.h"
#include "util/logging.hpp"

using namespace jumanpp;
#ifdef _WIN32
namespace io = nowide;
#else
namespace io = std;
#endif
struct InputOutput {
  std::unique_ptr<core::input::StreamReader> streamReader_;
  std::shared_ptr<io::ifstream> fileInput_;
  int currentInFile_ = 0;
  const std::vector<std::string>* inFiles_;
  StringPiece currentInputFilename_;
  std::istream* input_;

  std::shared_ptr<io::ofstream> fileOutput_;
  std::ostream* output_;

  Status moveToNextFile() {
    auto& fn = (*inFiles_)[currentInFile_];
    fileInput_.reset(new io::ifstream{fn});
    if (fileInput_->bad()) {
      return JPPS_INVALID_PARAMETER << "failed to open output file: " << fn;
    }
    input_ = fileInput_.get();
    currentInputFilename_ = fn;
    currentInFile_ += 1;
    return Status::Ok();
  }

  Status nextInput() {
    if (*input_) {
      JPP_RETURN_IF_ERROR(streamReader_->readExample(input_));
      return Status::Ok();
    }

    if (input_->fail()) {
      return JPPS_INVALID_STATE << "failed when reading from file: "
                                << currentInputFilename_;
    }

    return JPPS_NOT_IMPLEMENTED << "should not reach here, it is a bug";
  }

  Status initialize(const jumandic::JumanppConf& conf,
                    const core::CoreHolder& cholder) {
    inFiles_ = &conf.inputFiles.value();
    std::setlocale(LC_ALL, "");
    if (!inFiles_->empty()) {
      JPP_RETURN_IF_ERROR(moveToNextFile());
    } else {
      input_ = &io::cin;
      currentInputFilename_ = "<stdin>";
    }

    if (conf.outputFile == "-") {
      output_ = &io::cout;
    } else {
      fileOutput_.reset(new io::ofstream{conf.outputFile});
      output_ = fileOutput_.get();
    }

    auto inType = conf.inputType.value();
    if (inType == jumandic::InputType::Raw) {

      auto rdr = new core::input::PlainStreamReader{};

      streamReader_.reset(rdr);
      rdr->setMaxSizes(65535, 1024);
    } else {
      auto rdr = new core::input::PexStreamReader{};
      streamReader_.reset(rdr);
      JPP_RETURN_IF_ERROR(rdr->initialize(cholder, '&'));
    }

    return Status::Ok();
  }

  bool hasNext() {
    if (input_->good()) {
      auto ch = input_->peek();
      if (ch == std::char_traits<char>::eof()) {
        return false;
      }
    }
    while (input_->eof() && currentInFile_ < inFiles_->size()) {
      auto s = moveToNextFile();
      if (!s) {
        LOG_ERROR() << s.message();
      }
    }
    auto isOk = !input_->eof();
    return isOk;
  }
};
#ifdef _WIN32
int main(int argc,char** argv) {
  auto args=io::args(argc, argv);
  auto argvc = const_cast<const char**>(argv);

#else
int main(int argc,const char** argv) {
    auto argvc = argv;
#endif
  std::unique_ptr<std::ifstream> filePtr;
  jumandic::JumanppConf conf;
  Status s = jumandic::parseArgs(argc, argvc, &conf);
  if (!s) {
      io::cerr << s << "\n";
    return 1;
  }

  LOG_DEBUG() << "trying to create jumanppexec with model: "
              << conf.modelFile.value()
              << " and rnnmodel=" << conf.rnnModelFile.value();

  jumandic::JumanppExec exec{conf};
  s = exec.init();
  if (!s.isOk()) {
    if (conf.outputType == jumandic::OutputType::Version) {
      exec.printFullVersion();
      return 1;
    }

    if (conf.modelFile.isDefault()) {
        io::cerr << "Model file was not specified\n";
      return 1;
    }

    if (conf.outputType == jumandic::OutputType::ModelInfo) {
      exec.printModelInfo();
      return 1;
    }

    io::cerr << "failed to load model from disk: " << s;
    return 1;
  }

  if (conf.outputType == jumandic::OutputType::Version) {
    exec.printFullVersion();
    return 1;
  }

  if (conf.outputType == jumandic::OutputType::ModelInfo) {
    exec.printModelInfo();
    return 0;
  }

  InputOutput io;

  s = io.initialize(conf, exec.core());
  if (!s) {
      io::cerr << "Failed to initialize I/O: " << s;
    return 1;
  }

  int result = 0;

  while (io.hasNext()) {
    s = io.nextInput();
    if (!s) {
        io::cerr << "failed to read an example: " << s;
      result = 1;
      continue;
    }

    result = 0;

    s = io.streamReader_->analyzeWith(exec.analyzerPtr());
    if (!s) {
        io::cerr << s;
      *io.output_ << exec.emptyResult();
      continue;
    }

    s = exec.format()->format(*exec.analyzerPtr(), io.streamReader_->comment());
    if (!s) {
        io::cerr << s;
    } else {
      *io.output_ << exec.format()->result();
    }
  }

  return result;
}