async function getPlayers() {

    const url = "http://localhost:5161/players";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error fetching players");
        }

        const json = await response.json();
        console.log(json);


    } catch (error) {
        console.error(error);
    }

    


}

async function addPlayer(name) {
    const url = "http://localhost:5161/players";

    try {
        const response = await fetch("http://localhost:5161/players", {
            method: "POST",
            body: JSON.stringify({ id: 0, name: name, hiScore: 0 }),
        });
        if (!response.ok) {
            throw new Error("Error adding player");
        }
        console.log("Player added");
    } catch (error) {
        console.error(error);
    }

}

async function setPlayerScore(id) {
    const url = "http://localhost:5161/players/" + id;

    try {
        const response = await fetch(url, {
            method: "PUT",
            body: JSON.stringify({ hiScore: score }),
        })
    }
}