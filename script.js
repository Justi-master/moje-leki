let leki = [
    {
        id: 1,
        nazwa: "Axotret",
        typ: "naprzemienny",
        dawka1: 40,
        dawka2: 20,
        jednostka: "mg",
        dataStart: "2026-07-13",
        godzina: "20:00",
        przypomnienie: true,
        aktywny: true,
        przyjety: false
    },
];

let edytowanyLekId = null;

function pobierzDawkeNaDzis(lek){

    if(lek.typ === "staly"){
        return lek.dawka;
    }

    if(lek.typ === "naprzemienny"){

        const dzis = new Date();

        const start = new Date(lek.dataStart);

        const roznica = dzis - start;

        const liczbaDni = Math.floor(roznica / (1000 * 60 * 60 * 24));

        if(liczbaDni % 2 === 0){
            return lek.dawka1;
        }else{
            return lek.dawka2;
        }

    }

}

console.log("Liczba leków:", leki.length);

function wyswietlLeki(){

    const lista = document.getElementById("lista-lekow");

    lista.innerHTML = "";

    leki.forEach(lek => {

        lista.innerHTML += `
            <div class="lek">
                <h2>${lek.nazwa}</h2>
                <p>
                    <strong>Dawka:</strong>
                    ${pobierzDawkeNaDzis(lek)} ${lek.jednostka}
                </p>
                <p><strong>Godzina:</strong> ${lek.godzina}</p>
                <button
                    class="${lek.przyjety ? 'zielony' : 'czerwony'}"
                    onclick="oznaczJakoPrzyjety(${lek.id})">

                    ${lek.przyjety ? " Przyjęty" : " Nieprzyjęty"}

                </button>

            </div>
        `;

    });

}

function wyswietlZarzadzanie(){

    const lista = document.getElementById("lista-zarzadzania");

    lista.innerHTML = "";

    leki.forEach(lek => {

        lista.innerHTML += `
            <div class="pozycja-zarzadzania">

                <span>
                    <strong>${lek.nazwa}</strong><br>
                    ${pobierzDawkeNaDzis(lek)} ${lek.jednostka} • ${lek.godzina}
                </span>

                <div>
                    <button onclick="edytujLek(${lek.id})">✏️</button>
                    <button onclick="usunLek(${lek.id})">🗑️</button>
                </div>

            </div>
        `;

    });

}

function usunLek(id){

    const potwierdzenie = confirm("Czy na pewno chcesz usunąć ten lek?");

    if(!potwierdzenie){
        return;
    }

    leki = leki.filter(lek => lek.id !== id);

    zapiszLeki();

    wyswietlLeki();

    wyswietlZarzadzanie();

}

function edytujLek(id){

    const lek = leki.find(l => l.id === id);

    if(!lek){
        return;
    }

    edytowanyLekId = id;

    document.getElementById("nazwa").value = lek.nazwa;

    document.getElementById("ilosc").value = pobierzDawkeNaDzis(lek);

    document.getElementById("jednostka").value = lek.jednostka;

    document.getElementById("godzina").value = lek.godzina;

    document.getElementById("tytul-formularza").textContent = "✏️ Edytuj lek";

    formularz.classList.remove("ukryty");

    oknoZarzadzania.classList.add("ukryty");

}

function zapiszLeki(){

    localStorage.setItem("leki", JSON.stringify(leki));

}

const formularz = document.getElementById("formularz");

document.getElementById("dodaj").addEventListener("click", () => {

    formularz.classList.remove("ukryty");

});

function oznaczJakoPrzyjety(id){

    const lek = leki.find(l => l.id === id);

    if(!lek) return;

    lek.przyjety = !lek.przyjety;

    zapiszLeki();

    wyswietlLeki();

}

function wczytajLeki(){

    const zapisaneLeki = localStorage.getItem("leki");

    if(zapisaneLeki){
        leki = JSON.parse(zapisaneLeki);
    }

}

function wyswietlDate() {

    const dzis = new Date();

    const opcje = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    document.getElementById("data-dzis").textContent =
        dzis.toLocaleDateString("pl-PL", opcje);

}

wczytajLeki();
wyswietlDate();
wyswietlLeki();

document.getElementById("zapisz").addEventListener("click", dodajLek);

function dodajLek() {

    const nazwa = document.getElementById("nazwa").value;
    const ilosc = Number(document.getElementById("ilosc").value);
    const jednostka = document.getElementById("jednostka").value;
    const godzina = document.getElementById("godzina").value;

    if(nazwa.trim() === ""){
        alert("Podaj nazwę leku.");
        return;
    }

    const nowyLek = {
        id: leki.length + 1,
        nazwa: nazwa,
        typ: "staly",
        dawka: ilosc,
        jednostka: jednostka,
        godzina: godzina,
        przypomnienie: true,
        aktywny: true,
        przyjety: false
    };

    if(edytowanyLekId !== null){

        const lek = leki.find(l => l.id === edytowanyLekId);

        lek.nazwa = nazwa;
        lek.dawka = ilosc;
        lek.jednostka = jednostka;
        lek.godzina = godzina;

        edytowanyLekId = null;

    }else{

        leki.push(nowyLek);

    }

    zapiszLeki();

    wyswietlLeki();

    document.getElementById("nazwa").value = "";
    document.getElementById("ilosc").value = "";
    document.getElementById("jednostka").value = "mg";
    document.getElementById("godzina").value = "";
    
    document.getElementById("tytul-formularza").textContent = "➕ Dodaj lek";

    formularz.classList.add("ukryty");

}

document.getElementById("anuluj").addEventListener("click", () => {

    formularz.classList.add("ukryty");

});

const oknoZarzadzania = document.getElementById("okno-zarzadzania");

document.getElementById("zarzadzaj").addEventListener("click", () => {

    wyswietlZarzadzanie();
    oknoZarzadzania.classList.remove("ukryty");

});

document.getElementById("zamknij-zarzadzanie").addEventListener("click", () => {

    oknoZarzadzania.classList.add("ukryty");

});

if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

setInterval(sprawdzPrzypomnienia, 30000);

function sprawdzPrzypomnienia(){

    const teraz = new Date();

    const godzina =
        String(teraz.getHours()).padStart(2,"0") + ":" +
        String(teraz.getMinutes()).padStart(2,"0");

    leki.forEach(lek => {

        if(
            lek.godzina === godzina &&
            !lek.przyjety
        ){

            new Notification("💊 Czas na lek!", {
                body: lek.nazwa + " - " + pobierzDawkeNaDzis(lek) + " " + lek.jednostka,
                icon: "icon-192.png"
            });

        }

    });

}



