// Helper function to reset all videos and activate the target video
function resetAndPlayVideo(videoToActivate, allVideos) {
    allVideos.forEach((video) => {
        video.classList.remove("video-visible");
        video.pause();
    });

    if (videoToActivate) {
        videoToActivate.classList.add("video-visible");
        videoToActivate.play().catch((e) => console.error("Error playing video:", e));
    }
}

// Function to apply hover logic for forecast items
export function handleVideoHover(forecastItems, videoMap) {
    forecastItems.forEach((forecastItem) => {
        forecastItem.addEventListener("mouseenter", () => {
            const description = forecastItem.getAttribute("data-description").toLowerCase();
            const matchingVideo = videoMap[description];

            if (matchingVideo) {
                resetAndPlayVideo(matchingVideo, Object.values(videoMap));
            }
        });
    });

    // Optional: Reset videos when the mouse leaves the forecast container
    const forecastContainer = document.getElementById("forecast");
    if (forecastContainer) {
        forecastContainer.addEventListener("mouseleave", () => {
            resetAndPlayVideo(null, Object.values(videoMap)); // No active video
        });
    }
}
