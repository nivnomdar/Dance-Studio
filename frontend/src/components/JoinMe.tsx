function JoinMe() {
  return (
    <div className="h-screen relative ">
      <video className="video-bg w-full object-cover" autoPlay loop muted>
        <source src="/ClassesVideo.mp4" type="video/mp4"></source>
        הדפדפן לא תומך
      </video>
    </div>
  );
}

export default JoinMe;
