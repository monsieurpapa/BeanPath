import VideoTemplate from "@/components/video/VideoTemplate";
import VideoWithControls from "@/components/video/VideoWithControls";

const isUsecasePath =
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/usecase");

export default function App() {
  if (isUsecasePath) {
    return <VideoTemplate loop />;
  }
  return <VideoWithControls />;
}
