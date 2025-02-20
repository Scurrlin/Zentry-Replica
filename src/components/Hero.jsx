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
  // Background video index and preview (next) video index – videos are 0-indexed.
  const [bgIndex, setBgIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState(0);

  // Separate refs for the background and preview video elements.
  const bgVdRef = useRef(null);
  const previewVdRef = useRef(null);

  const handleVideoLoad = () => {
    setLoadedVideos((prev) => prev + 1);
  };

  useEffect(() => {
    if (loadedVideos === totalVideos - 1) {
      setLoading(false);
    }
  }, [loadedVideos]);

  // When the preview is clicked, start the transition.
  const handleMiniVdClick = () => {
    setHasClicked(true);
  };

  useGSAP(
    () => {
      if (hasClicked) {
        const tl = gsap.timeline({
          onComplete: () => {
            // After transition: make preview video the new background,
            // update the preview to the next video in cycle, and reset styles.
            setBgIndex(previewIndex);
            setPreviewIndex((previewIndex + 1) % totalVideos);
            gsap.set("#bg-video", { opacity: 1 });
            gsap.set("#preview-video", {
              scale: 0.5,
              width: "auto",
              height: "auto",
              visibility: "hidden",
            });
            setHasClicked(false);
          },
        });
        tl.set("#preview-video", { visibility: "visible" })
          .to("#preview-video", {
            transformOrigin: "center center",
            scale: 1,
            width: "100%",
            height: "100%",
            duration: 1,
            ease: "power1.inOut",
            onStart: () => {
              if (previewVdRef.current) previewVdRef.current.play();
            },
          })
          .to(
            "#bg-video",
            {
              opacity: 0,
              duration: 0.5,
              ease: "power1.inOut",
            },
            ">"
          );
      }
    },
    { dependencies: [hasClicked, previewIndex] }
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

  return (
    <div className="relative h-dvh w-screen overflow-x-hidden">
      {loading && (
        <div className="flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-violet-50">
          {/* https://uiverse.io/G4b413l/tidy-walrus-92 */}
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}

      <div
        id="video-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-blue-75"
      >
        <div>
          {/* Preview video: this is the center video that expands on click */}
          <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
            <VideoPreview>
              <div
                onClick={handleMiniVdClick}
                className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
              >
                <video
                  ref={previewVdRef}
                  src={getVideoSrc(previewIndex)}
                  loop
                  muted
                  autoPlay
                  playsInline
                  id="preview-video"
                  className="size-64 origin-center scale-150 object-cover object-center"
                  onLoadedData={handleVideoLoad}
                />
              </div>
            </VideoPreview>
          </div>

          {/* Background video: this is the full-screen video that remains until transition completes */}
          <video
            ref={bgVdRef}
            src={getVideoSrc(bgIndex)}
            loop
            muted
            autoPlay
            playsInline
            id="bg-video"
            className="absolute left-0 top-0 size-full object-cover object-center"
            onLoadedData={handleVideoLoad}
          />
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
              Enter the Metagame
              <br />
              Unleash the Play Economy
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