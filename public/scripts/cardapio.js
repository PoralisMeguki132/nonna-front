async function carregarCardapio(){

    let cardapio;

    try {
        const chamada = await fetch("http://localhost:8080/produtos");
        if (!chamada.ok){
            throw new Error("Response status: ${chamada.status}");
        }

        cardapio = await chamada.json();
    } catch(error){
        console.log("Houve um erro ao buscar os dados, tente novamente mais tarde.");
        return;
    }

    let carpioHTML = "";
    cardapio.forEach((item) -> {
        cardapioHTML
    }
}