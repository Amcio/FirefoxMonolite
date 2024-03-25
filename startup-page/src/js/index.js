// @noriaku | Kalos Lazo

//===: get username :===
async function handle_get_username() {
    const database = await fetch('src/database/profile.json');
    const data = await database.json();
    const username = data.username;

    // get links & categories
    const categories = data.categories;
    const links_sections = document.getElementById('section_bottom_links');

    // change each categorie link data
    for (let category in categories) {
        let actual_category_container = document.createElement('div');
        actual_category_container.className = 'generic_link';

        // make each prompt
        let promptLinkDiv = document.createElement('div');
        promptLinkDiv.className = 'prompt_link';
        promptLinkDiv.innerHTML = `<p><span class="col-01">➜</span> <span class="col-02">ls</span> <span class="col-02">-T</span> <span class="col-04">${category}/</span> </p>`;
        actual_category_container.appendChild(promptLinkDiv);

        // show category name as responde (from ls -T)
        let resPromptDiv = document.createElement('div');
        resPromptDiv.className = 'res_prompt';
        resPromptDiv.innerHTML = `<p class="res_folder">${category}/</p>`;

        // add each link from actual category
        for (let link in categories[category]) {
            let p = document.createElement('p');
            p.innerHTML = `└── <a href="${categories[category][link]}">${link}</a>`;
            resPromptDiv.appendChild(p);
        };

        actual_category_container.appendChild(resPromptDiv);
        links_sections.appendChild(actual_category_container);
    };

    // for all .username clases update data.
    const user_name_elements = document.getElementsByClassName("username");
    for (let i = 0; i < user_name_elements.length; i++) {
        user_name_elements[i].textContent = username;
    }
}

//===: current date implementation :===
function handle_current_date() {
    const current_date_element = document.getElementById('current_date');
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'short' });
    const day = now.getDate();

    current_date_element.textContent = `${month} ${day}`;
}

//===: get weather implementation :===
async function handle_current_weather() {
    const current_weather_element = document.getElementById('current_weather');

    const database = await fetch('src/database/profile.json');
    const database_json = await database.json();

    // const API = database_json.API_KEY;
    const city = database_json.city;
    // const country = database_json.country; // useless

    // TODO: add data validation.
    // First get coordinates
    const startTime = performance.now();

    async function get_coordinates(city) {
        return fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                const latitude = data.results[0].latitude;
                const longitude = data.results[0].longitude;
                return {'lat': latitude, 'long': longitude};
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                return {'lat': 0, 'long': 0};
            });
    };

    let data = await get_coordinates(city);
    const latitude = data.lat;
    const longitude = data.long;

    // Get weather data based on coordinates
    let temperature = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error('API response was not ok');
                            }
                            return response.json();
                        })
                        .then((data) => {
                           return data.current_weather.temperature; 
                        }).catch((error) => {
                            console.error('Error fetching data:', error);
                            return 0;
                        });

    temperature = Math.round(temperature);
    const endTime = performance.now();
    const description = `took ${Math.round((endTime - startTime + Number.EPSILON) * 100) / 100}ms`;

    current_weather_element.textContent = `${temperature} °C | ${description}`;
};

//===: current time implementation :===
function handle_current_time() {
    const current_time_element = document.getElementById('current_time');
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    current_time_element.textContent = `${hours}:${minutes}`;
};

window.onload = function() {
    if(!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      document.getElementById('search').autofocus = true;
      document.getElementById('search').focus();
    }
  };

handle_current_time();
handle_current_date();
handle_current_weather();
handle_get_username();

setInterval(handle_current_time, 60000);
