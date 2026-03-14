
window.LayaTower = {
  floorType(floor) {
    if (floor % 10 === 0) return "boss";
    if (floor % 5 === 0) return "mini";
    return "normal";
  }
};
