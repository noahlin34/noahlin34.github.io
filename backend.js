
export async function getPlayers() {

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

export async function addPlayer(name) {
    const url = "http://localhost:5161/players";
    let id;
    try {
        const response = await fetch("http://localhost:5161/players", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ id: 0, name: name, hiScore: 0 }),
        })
        if (!response.ok) {
            throw new Error("Error adding player");
        }

      let json = await response.json();
      id = parseInt(json.id,10);
      console.log("Player added, id is: " + id);
      return id;

   

        

    } catch (error) {
        console.error(error);
    }

}

export async function setPlayerScore(id, score) {
    const url = "http://localhost:5161/players/" + id + "?hiScore=" + score;
    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            method: "PUT",
        })  

        console.log("Player score set");
    }
    catch (error) {
        console.error(error);
    }
}

export async function dropPlayer(id) {
    const url = "http://localhost:5161/players/" + id;

    try {
        const response = await fetch(url, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error("Error dropping player");
        }
        console.log("Player dropped");
    } catch (error) {
        console.error(error);
    }
}