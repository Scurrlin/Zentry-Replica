import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { TiLocationArrow } from "react-icons/ti";
import { useEffect, useRef, useState } from "react";

import Button from "./Button";
import VideoPreview from "./VideoPreview";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const totalVideos = 4;
  const [currentIndex, setCurrentIndex] = useState(1);
  // Removed queuedIndex state because we no longer need a second video element on mobile.
  const [hasClicked, setHasClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState(0);

  // Refs for mobile video and overlay, and desktop preview
  const currentVideoRef = useRef(null);
  const nextVdRef = useRef(null);
  const overlayRef = useRef(null);
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
    return () => {
      clearTimeout(fallbackTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (loadedVideos >= totalVideos) {
      setLoading(false);
      clearTimeout(fallbackTimeout.current);
    }
  }, [loadedVideos]);

  // Desktop: Click handler for video preview expansion
  const handleMiniVdClick = () => {
    setHasClicked(true);
    setCurrentIndex((prevIndex) => (prevIndex % totalVideos) + 1);
  };

  // Desktop GSAP animation on click
  useGSAP(
    () => {
      if (hasClicked && !isMobile) {
        gsap.set("#next-video", { visibility: "visible" });
        gsap.to("#next-video", {
          transformOrigin: "center center",
          scale: 1,
          width: "100%",
          height: "100%",
          duration: 1,
          ease: "power1.inOut",
          onStart: () => nextVdRef.current.play(),
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

  // Common GSAP for the video frame
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

  // Mobile: When the current video ends, fade to black, update the video, then fade back in.
  const handleMobileVideoEnded = () => {
    gsap.to(overlayRef.current, {
      opacity: 1,
      duration: 0.5,
      onComplete: () => {
        const nextIndex = (currentIndex % totalVideos) + 1;
        setCurrentIndex(nextIndex);
        if (currentVideoRef.current) {
          currentVideoRef.current.src = getVideoSrc(nextIndex);
          currentVideoRef.current.play();
        }
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.5 });
      },
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
          {isMobile ? (
            // Mobile: Render a single video element with a black overlay for fade-to-black effect
            <>
              <video
                ref={currentVideoRef}
                src={getVideoSrc(currentIndex)}
                autoPlay
                muted
                playsInline
                onEnded={handleMobileVideoEnded}
                className="absolute left-0 top-0 size-full object-cover object-center"
                onLoadedData={handleVideoLoad}
                style={{ backgroundColor: 'black' }}
              />
              {/* Black overlay for fade-to-black effect */}
              <div
                ref={overlayRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "black",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />
            </>
          ) : (
            // Desktop: Preserve the original interactive video preview and GSAP animation
            <>
              <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg max-md:hidden">
                <VideoPreview>
                  <div
                    onClick={handleMiniVdClick}
                    className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
                  >
                    <video
                      ref={nextVdRef}
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

              <video
                ref={nextVdRef}
                src={getVideoSrc(currentIndex)}
                loop
                muted
                id="next-video"
                className="absolute-center invisible absolute z-20 size-64 object-cover object-center"
                onLoadedData={handleVideoLoad}
                playsInline={true}
              />
              <video
                src={getVideoSrc(currentIndex === totalVideos - 1 ? 1 : currentIndex)}
                autoPlay
                loop
                muted
                className="absolute left-0 top-0 size-full object-cover object-center"
                onLoadedData={handleVideoLoad}
                playsInline={true}
                style={{ backgroundColor: 'black' }}
              />
            </>
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