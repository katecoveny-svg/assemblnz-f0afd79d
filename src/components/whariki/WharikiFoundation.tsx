/**
 * Whāriki Foundation Layer — neumorphic light mode.
 * Soft pastel blurred blobs on #EEEEF2 for depth.
 */
const WharikiFoundation = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Teal blob — top left */}
      <div
        className="absolute"
        style={{
          width: 600, height: 600, top: "-5%", left: "-10%",
          background: "radial-gradient(circle, rgba(58,125,110,0.10) 0%, transparent 60%)",
          filter: "blur(120px)",
        }}
      />
      {/* Ochre blob — top right */}
      <div
        className="absolute"
        style={{
          width: 500, height: 500, top: "5%", right: "-5%",
          background: "radial-gradient(circle, rgba(74,165,168,0.08) 0%, transparent 60%)",
          filter: "blur(120px)",
        }}
      />
      {/* Lavender blob — center */}
      <div
        className="absolute"
        style={{
          width: 700, height: 700, top: "30%", left: "30%",
          background: "radial-gradient(circle, rgba(200,195,220,0.20) 0%, transparent 60%)",
          filter: "blur(150px)",
        }}
      />
      {/* Pounamu blob — bottom */}
      <div
        className="absolute"
        style={{
          width: 500, height: 500, bottom: "0%", left: "10%",
          background: "radial-gradient(circle, rgba(58,125,110,0.07) 0%, transparent 60%)",
          filter: "blur(120px)",
        }}
      />
    </div>
  );
};

export default WharikiFoundation;
