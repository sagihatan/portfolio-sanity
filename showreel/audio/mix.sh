#!/bin/bash
# Mix the music under the SFX stem and mux onto the story cut.
#   Plays the track from 0:00 (Sagi's choice): the film rides the piano intro and build, and the music
#   fades out at 22.1s — just before the track's band entry (22.19s) — so the film ends calm.
#   OFFSET / FADE_OUT_END / DIP are knobs if the section ever changes.
OFFSET=${OFFSET:-0}
DUR=22.7
FADE_IN=0.05
FADE_OUT_END=22.1
FADE_OUT_LEN=2.0
DIP=${DIP:-0}   # dB the music drops after the collapse (16.3s); 0 = none
MUSIC=audio/music/near-silence.wav
VIDEO=out/sagi-showreel-story.mp4

# 1) Music stem: trimmed, faded in/out
ffmpeg -y -loglevel error -ss "$OFFSET" -t "$DUR" -i "$MUSIC" \
  -af "volume='1-(1-pow(10,-$DIP/20))*min(max((t-16.3)/0.5,0),1)':eval=frame,afade=t=in:st=0:d=$FADE_IN,afade=t=out:st=$(echo "$FADE_OUT_END - $FADE_OUT_LEN" | bc):d=$FADE_OUT_LEN,aresample=48000" \
  -c:a pcm_f32le out/audio/music-stem.wav

# 2) Premix: SFX lifted over the music; music ducks gently under the key hits
ffmpeg -y -loglevel error -i out/audio/music-stem.wav -i out/audio/sfx-stem.wav -filter_complex \
  "[1:a]volume=10dB,asplit=2[k][s];[0:a][k]sidechaincompress=threshold=0.04:ratio=2.5:attack=8:release=280[md];[md][s]amix=inputs=2:normalize=0:duration=first" \
  -c:a pcm_f32le out/audio/premix.wav

# 3) Two-pass loudness to social spec: -14 LUFS, -1 dBTP
M=$(ffmpeg -hide_banner -i out/audio/premix.wav -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
P=$(echo "$M" | python3 -c "import json,sys;d=json.load(sys.stdin);print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
ffmpeg -y -loglevel error -i "$VIDEO" -i out/audio/premix.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1:LRA=11:${P}:linear=true,aresample=48000" -c:a aac -b:a 320k -shortest -movflags +faststart \
  out/sagi-showreel-story-sound.mp4
echo "wrote out/sagi-showreel-story-sound.mp4"
