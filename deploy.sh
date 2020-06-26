sudo docker stop tts-bot||true
sudo docker rm tts-bot||true
sudo docker run -d --name tts-bot --net tts-bot-net $CI_REGISTRY_IMAGE:latest
