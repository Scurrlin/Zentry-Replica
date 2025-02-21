import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { TiLocationArrow } from "react-icons/ti";
import { useEffect, useRef, useState } from "react";

import Button from "./Button";
import VideoPreview from "./VideoPreview";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [queuedIndex, setQueuedIndex] = useState(2);
  const [hasClicked, setHasClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState(0);

  const totalVideos = 4;
  const currentVideoRef = useRef(null);
  const queuedVideoRef = useRef(null);
  const fallbackTimeout = useRef(null);

  // Simple mobile detection (adjust breakpoint as needed)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const handleVideoLoad = () => {
    setLoadedVideos((prev) => prev + 1);
  };

  useEffect(() => {
    fallbackTimeout.current = setTimeout(() => {
      setLoading(false);
      console.warn("Fallback triggered: Some videos may not have been loaded.");
    }, 1500);
    return () => clearTimeout(fallbackTimeout.current);
  }, []);

  useEffect(() => {
    if (loadedVideos >= totalVideos) {
      setLoading(false);
      clearTimeout(fallbackTimeout.current);
    }
  }, [loadedVideos]);

  // Desktop video preview logic
  const handleMiniVdClick = () => {
    setHasClicked(true);
    setCurrentIndex((prevIndex) => (prevIndex % totalVideos) + 1);
  };

  useGSAP(
    () => {
      if (hasClicked) {
        gsap.set("#next-video", { visibility: "visible" });
        gsap.to("#next-video", {
          transformOrigin: "center center",
          scale: 1,
          width: "100%",
          height: "100%",
          duration: 1,
          ease: "power1.inOut",
          onStart: () => currentVideoRef.current.play(),
        });
        gsap.from("#current-video", {
          transformOrigin: "center center",
          scale: 0,
          duration: 1.5,
          ease: "power1.inOut",
        });
      }
    },
    { dependencies: [currentIndex], revertOnUpdate: true }
  );

  useGSAP(() => {
    gsap.set("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  const getVideoSrc = (index) => `videos/hero-${index}.mp4`;

  // Mobile: Handle the transition from current to queued video
  const handleVideoEnded = () => {
    gsap.to(currentVideoRef.current, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        // Swap the queued video into the current video slot
        setCurrentIndex(queuedIndex);
        const newQueuedIndex = (queuedIndex % totalVideos) + 1;
        setQueuedIndex(newQueuedIndex);
        // Update the queued video element's source immediately
        queuedVideoRef.current.src = getVideoSrc(newQueuedIndex);
        // Reset opacity for the next transition
        gsap.set(currentVideoRef.current, { opacity: 1 });
      }
    });
  };

  return (
    <div className="relative h-dvh w-screen overflow-x-hidden">
      {loading && (
        <div className="flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-violet-50">
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}

      <div id="video-frame" className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-blue-75">
        <div>
          {/* Desktop: Show the interactive video preview */}
          {!isMobile && (
            <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
              <VideoPreview>
                <div
                  onClick={handleMiniVdClick}
                  className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
                >
                  <video
                    ref={queuedVideoRef}
                    src={getVideoSrc((currentIndex % totalVideos) + 1)}
                    loop
                    muted
                    id="current-video"
                    className="size-64 origin-center scale-150 object-cover object-center"
                    onLoadedData={handleVideoLoad}
                    playsInline={true}
                  />
                </div>
              </VideoPreview>
            </div>
          )}

          {/* Mobile: Double buffering for smooth video transitions */}
          {isMobile ? (
            <>
              <video
                ref={currentVideoRef}
                src={getVideoSrc(currentIndex)}
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnded}
                className="absolute left-0 top-0 size-full object-cover object-center"
                onLoadedData={handleVideoLoad}
              />
              <video
                ref={queuedVideoRef}
                src={getVideoSrc(queuedIndex)}
                autoPlay
                muted
                playsInline
                className="absolute left-0 top-0 size-full object-cover object-center"
                style={{ opacity: 0 }}
                onLoadedData={handleVideoLoad}
              />
            </>
          ) : (
            // Desktop: Single auto-playing, looping video
            <video
              ref={currentVideoRef}
              src={getVideoSrc(currentIndex)}
              autoPlay
              muted
              playsInline
              loop
              className="absolute left-0 top-0 size-full object-cover object-center"
              onLoadedData={handleVideoLoad}
            />
          )}
        </div>

        <h1 className="special-font hero-heading absolute bottom-5 right-5 z-40 text-blue-75">
          G<b>A</b>MING
        </h1>

        <div className="absolute left-0 top-0 z-40 size-full">
          <div className="mt-24 px-5 sm:px-10">
            <h1 className="special-font hero-heading text-blue-100">
              redefi<b>n</b>e
            </h1>
            <p className="mb-5 max-w-64 font-robert-regular text-blue-100">
              Enter the Metagame Layer <br /> Unleash the Play Economy
            </p>
            <Button
              id="watch-trailer"
              title="Watch trailer"
              leftIcon={<TiLocationArrow />}
              containerClass="bg-yellow-300 flex-center gap-1"
            />
          </div>
        </div>
      </div>

      <h1 className="special-font hero-heading absolute bottom-5 right-5 text-black">
        G<b>A</b>MING
      </h1>
    </div>
  );
};

export default Hero;