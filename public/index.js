
var cursorDJ = 0
function loadAction(state) {
    const loader = document.getElementById('loader')
    if (state) {
        loader.style.display = 'block'
    } else {
        loader.style.display = 'none'
    }
}
var stateBefore = ''
var stateBefore2 = ''

async function getItem(type, id) {
    if (type == 'project') {
        const response = await fetch('/api/projects/' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            if(!response.ok) {showError('Error with /api/projects/\n' + response); return;}
            const data = await response.json();
            const [name, stage, projectType, demourl, repourl, ownerUsername, ownerID, projectID, upvotes, streak] = [data.name, data.stage, data.type, data.demo_url, data.repository_url, data.owner.username, data.owner.id, data.id, data.upvote_count, data.project_streak_days]
            const description = data.description ? data.description.toString().substring(0, 100) + '...' : 'No description provided.'
            console.debug(name, description, stage, projectType, demourl, repourl, ownerUsername, ownerID)
            console.debug(projectID, upvotes, streak)
            return {name, description, stage, projectType, demourl, repourl, ownerUsername, ownerID, projectID, upvotes, streak}
    }
}

async function longDescription(id) {
    const response = await fetch('/api/projects/' + id, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const data = await response.json();
    const description = data.description ? data.description.toString() : 'No description provided.'
    return description;
}

var app1num = 0
var app2num = 0



async function getProject(id) {
    console.debug('getproject ran')
    if (document.getElementById('item-' + id)) {
        return
    }

    const things = await getItem('project', id)
        var app = document.getElementById('app')
        const item = document.createElement('div')
        
        if (app1num >= 5) {
            app = document.getElementById('app2')
            app2num++
        } else {
            app1num++
        }
        const badges = await getbadges(id)
        var badgesss = ''
        if (badges.length > 3) {
            badges.splice(2)
            badges.push('+' + (badges.length - 2) + ' more')
        }
        badges.forEach(element => {
            const asda = randomColor()
            badgesss += `<div class="badge" style="background-color: ${asda};">${element}</div>`
        });
        item.style.animation = 'fadein 0.5s'
        item.classList.add('item')
        item.innerHTML = `
            <h1 class="item-title">${things.name}</h1>
            <sub>By ${things.ownerUsername}</sub>
            <div class="lazyhorizontal" style="gap: 5px;">
            ${badgesss}
            </div>
            <p>${things.description}</p>
            <button id="open-${things.projectID}" onclick="openProject(${things.projectID})">See More</button>
        `

        if (document.getElementById('item-' + id)) {
        return
        }

        item.id = 'item-' + things.projectID
        app.appendChild(item)
}
//getProject(835)

async function openProject(id) {
    const project = await getItem('project', id)
    const app = document.getElementById('app')
    const app2 = document.getElementById('app2')
    const description = await longDescription(id)
    if (description.length > 300) {
        style = 'overflow-y: scroll; max-height: 300px; font-size: 12px;'
    } else {
        style = ''
    }
    stateBefore = app.innerHTML
    stateBefore2 = app2.innerHTML
    app.style.animation = 'fadeout 0.5s'
    app2.style.animation = 'fadeout 0.5s'
    const [thumbnail, ownerImage] = await images(id)
    const thumbnailURL = await getImage(thumbnail)
    const bagedes = await getbadges(id)
    var badgesss = ''
    bagedes.forEach(element => {
        const asda = randomColor()
        badgesss += `<div class="badge" style="background-color: ${asda};">${element}</div>`
    });
    setTimeout(async () => {
        app.innerHTML = `
            <button id="back" class="back-button" onclick="closeProject()">Back</button>
            <div class="lazyvertical">
            <div class="thumbnail" style="background-image: url('${thumbnailURL}');"><div class="thumbnail-owner" style="background-image: url('${ownerImage}'); background-size: cover;"></div></div>
            <h1>${project.name}</h1>
            <sub>By ${project.ownerUsername}</sub>
            <div class="lazyhorizontal" style="gap: 5px;">
            ${badgesss}
            </div>
            <div class="iteminvis">
            <p style="${style}">${description}</p>
            </div>
            <div class="lazyhorizontal">
            <button onclick="openExternal('${project.demourl}')">View Demo</button>
            <button onclick="openExternal('${project.repourl}')">View Repository</button>
            </div>
            </div>
            <img id="temp" src="${thumbnailURL}" style="display: none;">
        `
        app.style.animation = 'fadein 0.5s'
    }, 400)
        app2.innerHTML = ''
        document.getElementById('more').style.animation = 'fadeout 0.5s'
        setTimeout(() => {
                document.getElementById('more').style.display = 'none'
        }, 500)
        app.style.animation = 'fadein 0.5s'
}
function closeProject() {
    const app = document.getElementById('app')
    const app2 = document.getElementById('app2')
    app.style.animation = 'fadeout 0.5s'
    setTimeout(() => {
        app.innerHTML = stateBefore
        app2.innerHTML = stateBefore2
        app2.style.animation = 'fadein 0.5s'
        app.style.animation = 'fadein 0.5s'
        document.getElementById('more').style.animation = 'fadein 0.5s'
        document.getElementById('more').style.display = 'block'
    }, 500)
}
async function images(id) {
    const response = await fetch('/api/projects/' + id, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const data = await response.json();
    return [data.thumbnail_url, data.owner.image]
    
}


function openExternal(url) {
    document.getElementById('warning-popup').style.display = 'block'
    document.getElementById('warning-popup').style.animation = 'fadein 0.5s'
    document.getElementById('warning-popup').innerHTML = document.getElementById('warning-popup').innerHTML.replace('{url}', url)
    document.getElementById('warn-confirm').onclick = () => {
        window.open(url, '_blank');
        document.getElementById('warning-popup').style.animation = 'fadeout 0.5s'
        setTimeout(() => {
            document.getElementById('warning-popup').style.display = 'none'
            document.getElementById('warning-popup').innerHTML = document.getElementById('warning-popup').innerHTML.replace(url, '{url}')
        }, 500)
    }
    document.getElementById('warn-cancel').onclick = () => {
        document.getElementById('warning-popup').style.animation = 'fadeout 0.5s'
        setTimeout(() => {
            document.getElementById('warning-popup').style.display = 'none'
            document.getElementById('warning-popup').innerHTML = document.getElementById('warning-popup').innerHTML.replace(url, '{url}')
        }, 500)
    }
}
function Login() {
    const app = document.getElementById('app')
    const loginbtn = document.createElement('button')
    loginbtn.innerText = 'Login with Hack Club'
    loginbtn.onclick = () => {
        window.location.href = `https://auth.hackclub.com/oauth/authorize?client_id=a2107a6fc2455c8eb2f8b48fd969844f&redirect_uri=${window.location.origin}%2Foauth%2Fcallback&response_type=code&scope=openid+profile+verification_status+slack_id`;
    }
    app.appendChild(loginbtn)
}


async function ExploreProjects(cursor, sort, status, search) {
    console.debug('explore projecyts ran')
    const app = document.getElementById('app')
    if (!cursor) {
        cursor = '0'
    }
    if (search) {
        search = '&search=' + search
    } else {
        search = ''
    }
    await fetch(`/api/explore/projects?sort=${sort}&status=${status}&limit=5&cursor=${cursor}${search}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then((data) => {
        console.debug(data)
        data.items.forEach(element => {
            getProject(element.id)
            cursorDJ = data.next_cursor
        });
    })
    loadAction(false)
}


async function checkAuth() {
    const token = localStorage.getItem('access_token')
    if (token) {
        try {
            const response = await fetch(`/checktoken?token=${token}`)
            const data = await response.json()
            if (data.success) {
                ExploreProjects('0', 'popularity')
                ExploreProjects('5', 'popularity')
            } else {
                Login()
            }
        } catch (error) {
            showError(error)
        }
    } else {
        Login()
    }
    loadAction(true)
}
checkAuth()

async function clearProjects() {
    console.debug('clear projects ran')
    const app = document.getElementById('app')
    const app2 = document.getElementById('app2')
    app.style.animation = 'fadeout 0.5s'
    app2.style.animation = 'fadeout 0.5s'
    setTimeout(() => {
        app.innerHTML = `<svg id="loader" width="150px" fill="#555" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="4" cy="12" r="3" opacity="1"><animate id="spinner_qYjJ" begin="0;spinner_t4KZ.end-0.25s" attributeName="opacity" dur="0.75s" values="1;.2" fill="freeze"/></circle><circle cx="12" cy="12" r="3" opacity=".4"><animate begin="spinner_qYjJ.begin+0.15s" attributeName="opacity" dur="0.75s" values="1;.2" fill="freeze"/></circle><circle cx="20" cy="12" r="3" opacity=".3"><animate id="spinner_t4KZ" begin="spinner_qYjJ.begin+0.3s" attributeName="opacity" dur="0.75s" values="1;.2" fill="freeze"/></circle></svg><noscript>Woah woah woah, you need JavaScript enabled</noscript>`
        app2.innerHTML = ''
        loadAction(false)
    }, 500);
    app1num = 0
    app2num = 0
}

function showError(error) {
    const errorbox = document.getElementById('error')
    const errorp = document.getElementById('errorp')
    errorbox.style.display = 'block';
    errorbox.style.animation = 'fadein 0.5s'
    errorp.innerHTML = error
}
async function getImage(url) {
    url = url.replace('https://cdn.hackclub.com/', '');
    const image = await fetch('/image/' + url)
    console.log(image)
    return image.url
}

async function getbadges(id) {
    const badges = []
    const project = await fetch('/api/projects/' + id, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
    .then(data => { 
        badges.push('Level ' + data.level + ' ' + data.type)
        if (data.is_extra_fruity == true) {
            badges.push('Extra Fruity')
        }
        if (data.project_streak_days >= 7) {
            badges.push(data.project_streak_days + ' Day Streak')
        }
        if (data.activeShip != null && data.activeShip.status == 'under_review') {
            badges.push('In Queue')
        }
        if (data.needsChangesShip != null && data.needsChangesShip.status == 'needs_changes') {
            badges.push('Needs Changes')
        }
    });
    return badges
}

function randomColor() {
    const list = ['#ff353571', '#ffa3315f', '#f9ff4466', '#60ff4053', '#46f0ff60', '#3c87ff54', '#6449ff5d', '#ff40ff55']
    return list[Math.floor(Math.random() * list.length)]
}

function getUser(id) {
    return fetch('/api/users/' + id, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
    .then(data => {
        var app = document.getElementById('app')
        const item = document.createElement('div')
        
        if (app1num >= 5) {
            app = document.getElementById('app2')
            app2num++
        } else {
            app1num++
        }
        var awd = ''
        if (data.projects.length >= 2) {
            awd = `${data.projects[0].name} and ${data.projects[1].name}`
        } else if (data.projects.length == 1) {
            awd = data.projects[0].name
        } else {
            awd = `No projects yet`
        }
        console.debug(app, app1num, app2num)
        item.style.animation = 'fadein 0.5s'
        item.classList.add('item')
        if (data.username == 'maxstellar') {
            aijduhygi = '<div class="badge" style="background-color: #ff353571;">Furry</div>'
        } else {
            aijduhygi = ''
        }
        item.innerHTML = `
            <div class="user-image" style="background-image: url('${data.image}');"></div>
            <h1 class="item-title">${data.username}</h1>
            ${aijduhygi}
            <p>Has ${data.project_count} project(s) in total, including ${awd}</p>
            <button id="open-${data.id}" onclick="openProject(${data.id})">See More</button>
        `

        if (document.getElementById('user-' + data.id)) {
            return
        }

        item.id = 'user-' + data.id
        app.appendChild(item)
    })
}

async function ExploreUsers() {
    const data = await fetch('/api/explore/people?sort=popularity&limit=10', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => response.json())

        data.items.forEach(element => {
            getUser(element.id)
        });
}

function toggle(type) {
    if (type == 'projects') {
        const dropdowns = [document.getElementById('status'), document.getElementById('sort')]
        dropdowns.forEach(dropdown => {
            dropdown.style.animation = 'fadeout 0.5s'
            setTimeout(() => {        
                dropdown.style.display = 'none'
            }, 500)
        })
    } else if (type == 'people') {
        const dropdowns = [document.getElementById('status'), document.getElementById('sort')]
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'block'
            dropdown.style.animation = 'fadein 0.5s'
        })
    } else if (type == 'search') {
        const search = document.getElementById('search')
        if (search.style.display == 'block') {
            search.style.animation = 'fadeout 0.5s'
            setTimeout(() => {
                search.style.display = 'none'
            }, 500)
        } else {
            search.style.display = 'block'
            search.style.animation = 'fadein 0.5s'
        }
    }
}

async function searchProjects() {
    const query = document.getElementById('search').value.trim()
    if (query.length == 0) {
        return
    }
    clearProjects()
    setTimeout(() => {
    ExploreProjects('0', document.getElementById('sort').value, document.getElementById('status').value, query)
    }, 500)
}
document.getElementById('search').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchProjects()
    }
});