'use strict';

const api = 'http://localhost:8080';

const createTeamModal = document.getElementById('createTeamModal');
const createTeamName = document.getElementById('createTeamName');
const createRiderTotalTime = document.getElementById('createRiderTotalTime');
const createRiderMountainPoint = document.getElementById('createRiderMountainPoint');
const createRiderSprintPoint = document.getElementById('createRiderSprintPoint');
const createRiderAge = document.getElementById('createRiderAge');
const createRiderNationality = document.getElementById('createRiderNationality');

const editRiderModal = document.getElementById('editRiderModal');
const editRiderName = document.getElementById('editRiderName');
const editRiderTotalTime = document.getElementById('editRiderTotalTime');
const editRiderMountainPoint = document.getElementById('editRiderMountainPoint');
const editRiderSprintPoint = document.getElementById('editRiderSprintPoint');
const editRiderAge = document.getElementById('editRiderAge');
const editRiderNationality = document.getElementById('editRiderNationality');
const editRiderId = document.getElementById('editRiderId');

const createRiderModal = document.getElementById('createRiderModal');
const createRiderName = document.getElementById('createRiderName');
const teamSelect = document.getElementById('teamSelect');

const size = document.getElementById('size');
const sort = document.getElementById('sort');
const searchByName = document.getElementById('searchByName');
const filterTeam = document.getElementById('filterTeam');

async function loadTable() {
  const searchParams = new URL(location.href).searchParams;
  const requestUrl = new URL(`${api}/riders`);

  const filters = ['sort', 'size', 'page', 'search', 'teamId'];
  Object.values(filters).forEach(filter => {
    if (null !== searchParams.get(filter)) {
      requestUrl.searchParams.append(filter, searchParams.get(filter));
    }
  })

  const riderResponse = await new HttpClient(requestUrl).get();

  const riderTable = document.getElementById('riderTable');

  riderTable.innerHTML = '';
  Object.values(riderResponse.data.content).forEach(rider => {
    riderTable.innerHTML += `<tr class="align-middle">
   <td>${rider.riderId}</td>
   <td>${rider.team.name}</td>
   <td>${rider.name}</td>
   <td>${rider.age}</td>
   <td>${rider.nationality}</td>
   <td>${rider.totalTime}</td>
   <td>${rider.mountainPoint}</td>
   <td>${rider.sprintPoint}</td>
   <td class="text-end">
       <button type="button" class="btn btn-outline-secondary" onclick="showEditRiderModal(${rider.riderId})">Redigér</button>
       <button type="button" class="btn btn-outline-danger" onclick="deleteRider(${rider.riderId})">Slet</button>
   </td>
</tr>`;
  });

  // If there are no elements to display, show the last page containing data
  if (searchParams.get('page') > riderResponse.data.totalPages) {
    await updatePage(riderResponse.data.totalPages);
  }

  addPagination(riderResponse.data);
  addTotalElements(riderResponse.data);
}

function addTotalElements(data) {
  const paginationDesc = document.getElementById("paginationDesc");

  paginationDesc.innerHTML = `<strong>${data.number + 1}</strong> af <strong>${data.totalPages}</strong> sider (i alt <strong>${data.totalElements}</strong> ryttere)`;
}

function showCreateTeamModal() {
  new bootstrap.Modal(createTeamModal).show();
}

async function showCreateRiderModal() {
  new bootstrap.Modal(createRiderModal).show();
  await addSelectTeamModal();
}

async function teamCreate() {
  const team = {
    'name': createTeamName.value,
  };
  const teamResponse = await new HttpClient(`${api}/teams`).post(team);

  createTeamName.value = '';

  displayMessage(teamResponse.success, teamResponse.message);
}

async function riderCreate() {
  const rider = {
    'name': createRiderName.value,
    'totalTime': createRiderTotalTime.value,
    'mountainPoint': createRiderMountainPoint.value,
    'sprintPoint': createRiderSprintPoint.value,
    'age': createRiderAge.value,
    'nationality': createRiderNationality.value
  };

  const riderResponse = await new HttpClient(`${api}/teams/${teamSelect.value}/riders`).post(rider);

  const resetValues = [createRiderName, createRiderTotalTime, createRiderMountainPoint, createRiderSprintPoint, createRiderAge, createRiderNationality]
  Object.values(resetValues).forEach(val => {
    val.value = '';
  });

  displayMessage(riderResponse.success, riderResponse.message);

  await loadTable();
  await displayJerseyCards();
}

async function showEditRiderModal(riderId) {
  const riderResponse = await new HttpClient(`${api}/riders/${riderId}`).get();

  new bootstrap.Modal(editRiderModal).show();

  editRiderId.value = riderResponse.content.riderId;
  editRiderName.value = riderResponse.content.name;
  editRiderTotalTime.value = riderResponse.content.totalTime;
  editRiderMountainPoint.value = riderResponse.content.mountainPoint;
  editRiderSprintPoint.value = riderResponse.content.sprintPoint;
  editRiderAge.value = riderResponse.content.age;
  editRiderNationality.value = riderResponse.content.nationality;
}

async function editRider() {
  const rider = {
    'name': editRiderName.value,
    'totalTime': editRiderTotalTime.value,
    'mountainPoint': editRiderMountainPoint.value,
    'sprintPoint': editRiderSprintPoint.value,
    'age': editRiderAge.value,
    'nationality': editRiderNationality.value
  };

  const newRider = await new HttpClient(`${api}/riders/${editRiderId.value}`).put(rider);

  displayMessage(newRider.success, newRider.message);

  await loadTable();
  await displayJerseyCards();
}

async function deleteRider(riderId) {
  const riderResponse = await new HttpClient(`${api}/riders/${riderId}`).delete();

  displayMessage(riderResponse.success, riderResponse.message);

  await loadTable();
  await displayJerseyCards();
}

function displayMessage(success, message) {
  const toast = document.getElementById('liveToast');
  const toastMessage = document.getElementById('toastMessage');

  if (success) {
    toast.classList.remove('bg-danger');
    toast.classList.add('bg-success');
  } else {
    toast.classList.remove('bg-success');
    toast.classList.add('bg-danger');
  }

  toastMessage.innerText = message;
  new bootstrap.Toast(toast).show();
}

async function updatePage(page) {
  updateParam('page', page);

  await loadTable();
}

function addPagination(data) {
  const pagination = document.getElementById("pagination");
  const currentPage = data.number + 1;

  pagination.innerHTML = '';

  // Previews
  const prevName = 'Forrige';
  if (!data.first) {
    let prevPage = (currentPage - 1);
    pagination.innerHTML += `<li class="page-item">
            <button class="page-link" onclick="updatePage(${prevPage})" tabIndex="-1" aria-disabled="true">${prevName}</button>
          </li>`;
  } else {
    pagination.innerHTML += `<li class="page-item disabled">
            <button class="page-link" tabIndex="-1" aria-disabled="true">${prevName}</button>
          </li>`;
  }

  // Numbers
  for (let page = 1; page <= data.totalPages; page++) {
    if (page === currentPage) {
      pagination.innerHTML += `<li class="page-item active" aria-current="page">
      <span class="page-link">${page}</span>
    </li>`
    } else {
      pagination.innerHTML += `<li class="page-item"><button class="page-link" onclick="updatePage(${page})">${page}</button></li>`;
    }
  }

  // Next
  const nextName = 'Næste';
  if (!data.last) {
    let nextPage = (currentPage + 1);

    pagination.innerHTML += `<li class="page-item">
            <button class="page-link" onclick="updatePage(${nextPage})" tabIndex="-1" aria-disabled="true">${nextName}</button>
          </li>`;
  } else {
    pagination.innerHTML += `<li class="page-item disabled">
            <button class="page-link" tabIndex="-1" aria-disabled="true">${nextName}</button>
          </li>`;
  }
}

function addSize() {
  const values = [5, 10, 20, 50, 100];

  size.innerHTML = '';
  Object.values(values).forEach(value => {
    size.innerHTML += `<option value="${value}">${value}</option>`;
  })

  size.value = new URL(location.href).searchParams.get("size"); // reset size
}

async function addSelectTeamModal() {
  const teams = await new HttpClient(`${api}/teams`).get();

  teamSelect.innerHTML = '';
  Object.values(teams.data.content).forEach(el => {
    teamSelect.innerHTML += `<option value="${el.teamId}">${el.name}</option>`;
  });
}

function addSort() {
  const map = new Map();
  map.set('totalTime,asc', 'Stigende');
  map.set('totalTime,desc', 'Faldende');

  sort.innerHTML = '';
  map.forEach((value, key) => {
    sort.innerHTML += `<option value="${key}">${value}</option>`;
  });

  sort.value = new URL(location.href).searchParams.get('sort'); // reset sort
}

function updateSearchLabel() {
  document.getElementById('searchByNameLabel').innerHTML = 'Søg efter rytter';
}

function updateParam(key, value) {
  const url = new URL(location.href);

  url.searchParams.set(key, value);
  history.replaceState(null, null, url);
}


async function addSelectTeamFilter() {
  const teams = await new HttpClient(`${api}/teams`).get();

  filterTeam.innerHTML = `<option value="">Alle</option>`;

  Object.values(teams.data.content).forEach(el => {
    filterTeam.innerHTML += `<option value="${el.teamId}">${el.name}</option>`;
  });

  filterTeam.value = new URL(location.href).searchParams.get("teamId"); // reset filter // TODO
}

function setDefaultValues() {
  const url = new URL(location.href).searchParams;

  if (null === url.get('sort')) {
    const sortDefaultValue = 'totalTime,asc';
    sort.value = sortDefaultValue;
    updateParam('sort', sortDefaultValue);
  }

  if (null === url.get('size')) {
    const sizeDefaultValue = 5;
    size.value = sizeDefaultValue;
    updateParam('size', sizeDefaultValue);
  }

  if (null === url.get('teamId')) {
    const teamIdDefaultValue = '';
    filterTeam.value = teamIdDefaultValue;
    updateParam('teamId', teamIdDefaultValue);
  }
}

async function displayJerseyCards() {

  const jerseysCards = document.getElementById('jerseysCards');

  const jerseys = [{
    "name": "Gule trøje",
    "img": "img/yellow.png",
    "rider": (await new HttpClient(`${api}/riders/jerseys/1`).get()).content
  }, {
    "name": "Hvide trøje",
    "img": "img/white.png",
    "rider": (await new HttpClient(`${api}/riders/jerseys/2`).get()).content
  }, {
    "name": "Grønne trøje",
    "img": "img/green.png",
    "rider": (await new HttpClient(`${api}/riders/jerseys/3`).get()).content
  }, {
    "name": "Prikkede trøje",
    "img": "img/polka-dot.png",
    "rider": (await new HttpClient(`${api}/riders/jerseys/4`).get()).content
  }];

  jerseysCards.innerHTML = '';

  Object.values(jerseys).forEach(el => {

    if (el.rider !== undefined) { // if no riders for the given filter
      jerseysCards.innerHTML += `<div class="col-sm-${12 / jerseys.length}">
      <div class="card mt-3">
        <img src="${el.img}" class="card-img-top jersey-img mx-auto my-3" alt="${el.name}">
        <div class="card-header text-center">
          ${el.name}
        </div>
        <div class="card-body">
          <p class="card-text"><strong>Rytter:</strong> ${el.rider.name}</p>
          <p class="card-text"><strong>Alder:</strong> ${el.rider.age}</p>
          <p class="card-text"><strong>Nationality:</strong> ${el.rider.nationality}</p>
          <p class="card-text"><strong>Team:</strong> ${el.rider.team.name}</p>
          <p class="card-text"><strong>Tid i alt:</strong> ${el.rider.totalTime}</p>
          <p class="card-text"><strong>Bjerg point:</strong> ${el.rider.mountainPoint}</p>
          <p class="card-text"><strong>Sprint point:</strong> ${el.rider.sprintPoint}</p>
        </div>
      </div>
    </div>`;
    }
  })
}

searchByName.addEventListener('keyup', async () => {
  await updateParam('search', searchByName.value);

  await loadTable();
});

size.addEventListener("change", async () => {
  await updateParam('size', size.value);
  await updateParam('page', 1); // reset page

  await loadTable();
})

filterTeam.addEventListener("change", async () => {
  await updateParam('teamId', filterTeam.value);
  updateSearchLabel();

  await loadTable();
})

sort.addEventListener("change", async () => {
  await updateParam('sort', sort.value)

  await loadTable();
})

createTeamModal.addEventListener('shown.bs.modal', () => {
  createTeamName.focus()
})

editRiderModal.addEventListener('shown.bs.modal', () => {
  editRiderName.focus()
})

addEventListener('load', async () => {
  addSize();
  addSort();
  await addSelectTeamFilter();
  setDefaultValues();
  updateSearchLabel();
  await displayJerseyCards();

  await loadTable();
})
