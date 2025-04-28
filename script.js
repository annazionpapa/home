// 데이터 저장
let groups = JSON.parse(localStorage.getItem('groups')) || [];
let isDeleteMode = false;

// DOM 요소
const groupsContainer = document.getElementById('groups');
const addGroupButton = document.getElementById('addGroup');
const deleteModeButton = document.getElementById('deleteModeButton');

// 새 그룹 추가
addGroupButton.addEventListener('click', () => {
    const groupName = prompt('그룹 이름을 입력하세요:');
    if (groupName) {
        addGroup(groupName);
    }
});

// 그룹 추가 함수
function addGroup(name) {
    const group = {
        id: Date.now(),
        name: name,
        sites: []
    };
    groups.push(group);
    saveGroups();
    renderGroups();
}

// 사이트 블록 추가
function addSite(groupId, name = '', url = '') {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        group.sites.push({
            id: Date.now(),
            name: name || '새 사이트',
            url: url || 'https://',
            width: 200,
            height: 100
        });
        saveGroups();
        renderGroups();
    }
}

// 사이트 수정
function editSite(groupId, siteId) {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        const site = group.sites.find(s => s.id === siteId);
        if (site) {
            const newName = prompt('사이트 이름을 입력하세요:', site.name);
            if (newName !== null) {
                const newUrl = prompt('사이트 주소를 입력하세요:', site.url);
                if (newUrl !== null) {
                    site.name = newName;
                    site.url = newUrl;
                    saveGroups();
                    renderGroups();
                }
            }
        }
    }
}

// 사이트 삭제
function deleteSite(groupId, siteId) {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        group.sites = group.sites.filter(s => s.id !== siteId);
        saveGroups();
        renderGroups();
    }
}

// 삭제 모드 토글
function toggleDeleteMode() {
    isDeleteMode = !isDeleteMode;
    deleteModeButton.textContent = isDeleteMode ? '삭제 모드 종료' : '삭제 모드';
    renderGroups();
}

// 사이트 클릭 시 새 창에서 열기
function openSite(url) {
    if (!isDeleteMode) {
        window.open(url, '_blank');
    }
}

// 그룹 렌더링
function renderGroups() {
    groupsContainer.innerHTML = '';
    groups.forEach(group => {
        const groupElement = document.createElement('div');
        groupElement.className = 'group';
        groupElement.innerHTML = `
            <div class="group-header">
                <div class="group-title">${group.name}</div>
                <div>
                    <button onclick="addSite(${group.id})">사이트 추가</button>
                    <button onclick="deleteGroup(${group.id})">그룹 삭제</button>
                </div>
            </div>
            <div class="sites-container" data-group-id="${group.id}">
                ${group.sites.map(site => {
                    return `
                        <div class="site-block" 
                             draggable="true" 
                             data-site-id="${site.id}" 
                             ondblclick="editSite(${group.id}, ${site.id})"
                             onclick="openSite('${site.url}')"
                             style="width: ${site.width}px; height: ${site.height}px">
                            <div class="site-content">
                                <div>${site.name}</div>
                                <div>${site.url}</div>
                            </div>
                            ${isDeleteMode ? `
                                <div class="site-delete-button">
                                    <button onclick="event.stopPropagation(); deleteSite(${group.id}, ${site.id})">삭제</button>
                                </div>
                            ` : ''}
                            <div class="resize-handle"></div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        groupsContainer.appendChild(groupElement);
    });
}

// 그룹 삭제
function deleteGroup(groupId) {
    if (confirm('이 그룹을 삭제하시겠습니까?')) {
        groups = groups.filter(g => g.id !== groupId);
        saveGroups();
        renderGroups();
    }
}

// 데이터 저장
function saveGroups() {
    localStorage.setItem('groups', JSON.stringify(groups));
}

// 초기 렌더링
renderGroups(); 