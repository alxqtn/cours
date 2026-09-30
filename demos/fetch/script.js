// const getStagiaires = async () => {}

async function getStagiaires() {
  const liste = document.getElementById("liste-stagiaires")

  try {
    const res = await fetch("stagiaires.json");
    if (res.ok) {
      const stagiaires = await res.json()
      stagiaires.forEach(stagiaire => {
        const li = document.createElement("li")
        li.textContent = `${stagiaire.nom} ${stagiaire.prenom} ${stagiaire.promo.nom}`
        liste.appendChild(li)
      })
    }
  } catch (err) {
    console.error("Coucou ça marche pas: ", err)
  }
}

getStagiaires()
