"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import throttle from "lodash/throttle";

import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

import { TranscriptSchema } from "@/lib/types";

/**
 * Renders an audio player that show the corresponding segment of the transcript
 */
export default function Audio({
  audioUrl,
  rawTranscript,
}: {
  audioUrl: string;
  rawTranscript: TranscriptSchema["segments"];
}) {
  const [audioPosition, setAudioPosition] = useState(0);
  const [segment, setSegment] = useState("");

  // show segment based on audio position
  useEffect(() => {
    if (!rawTranscript) return;
    if (audioPosition === 0) {
      setSegment(rawTranscript[0].text);
      return;
    }

    const actualSegment = rawTranscript.find(
      (seg) => audioPosition > seg.start && audioPosition <= seg.end,
    );
    if (actualSegment) setSegment(actualSegment.text);
  }, [audioPosition, rawTranscript]);

  const throttledHandleListen = useMemo(
    () =>
      throttle((e: Event) => {
        const target = e.target as HTMLAudioElement;
        setAudioPosition(target.currentTime);
      }),
    [setAudioPosition],
  );

  const handleListen = useCallback(
    (e: Event) => {
      throttledHandleListen(e);
    },
    [throttledHandleListen],
  );

  return (
    <div className="relative">
      <AudioPlayer
        autoPlay={false}
        autoPlayAfterSrcChange={false}
        customAdditionalControls={[]}
        timeFormat={"hh:mm:ss"}
        style={{
          width: "100%",
          background: "var(--background-color)",
        }}
        src={audioUrl}
        onListen={handleListen}
      />

      <div className="h-34 flex flex-row p-2 sm:h-24 lg:h-20 lg:min-h-fit">
        <div className="line-clamp-4 flex-auto text-sm">
          <span className="font-bold italic">Unedited transcript:</span>{" "}
          {segment}
        </div>
      </div>
    </div>
  );
}
