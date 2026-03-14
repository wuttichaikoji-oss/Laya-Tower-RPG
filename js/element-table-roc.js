
(function () {
  const elements = ["Neutral", "Fire", "Water", "Wind", "Earth", "Holy", "Shadow", "Ghost", "Poison", "Undead"];
  const strongAgainst = {
    Fire: ["Wind", "Undead"],
    Water: ["Fire"],
    Wind: ["Water"],
    Earth: ["Wind"],
    Holy: ["Shadow", "Undead"],
    Shadow: ["Holy"],
    Ghost: ["Poison"],
    Poison: ["Holy"],
    Undead: ["Poison"],
    Neutral: []
  };
  const weakAgainst = {
    Fire: ["Water"],
    Water: ["Wind"],
    Wind: ["Earth"],
    Earth: ["Fire"],
    Holy: ["Poison", "Shadow"],
    Shadow: ["Holy"],
    Ghost: ["Holy"],
    Poison: ["Ghost", "Undead"],
    Undead: ["Fire", "Holy"],
    Neutral: []
  };

  function getMultiplier(attackerElement, defenderElement, attackerLevel = 1, defenderLevel = 1) {
    if (attackerElement === "Neutral" || defenderElement === "Neutral") return 1;
    if ((attackerElement === "Poison" && defenderElement === "Undead") || (attackerElement === "Undead" && defenderElement === "Ghost")) {
      return 0;
    }
    let multiplier = 1;
    if ((strongAgainst[attackerElement] || []).includes(defenderElement)) multiplier += 0.25 + attackerLevel * 0.05;
    if ((weakAgainst[attackerElement] || []).includes(defenderElement)) multiplier -= 0.20 + defenderLevel * 0.05;
    return Math.max(0, Number(multiplier.toFixed(2)));
  }

  window.ElementROC = { elements, getMultiplier };
})();
