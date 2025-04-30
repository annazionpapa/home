// 데이터 저장
let groups = [];
let isDeleteMode = false;
let isEditMode = false;

// DOM 요소
const groupsContainer = document.getElementById('groups');
const addGroupButton = document.getElementById('addGroup');
const deleteModeButton = document.getElementById('deleteModeButton');

// JSON 파일 로드
function loadData() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            groups = data;
            renderGroups();
        })
        .catch(error => {
            console.log('데이터 파일이 없습니다. 새로 시작합니다.');
            groups = [];
            renderGroups();
        });
}

// 비밀번호 암호화 함수
function encryptPassword(password) {
    return btoa(password.split('').reverse().join(''));
}

// JSON 파일 저장
function saveData() {
    const password = prompt('데이터를 저장하기 위해 비밀번호를 입력하세요:');
    // 암호화된 비밀번호: '332211001802'를 암호화한 값
    const encryptedPassword = 'MzMyMjExMDAxODAy';
    
    if (encryptPassword(password) === encryptedPassword) {
        const dataStr = JSON.stringify(groups, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('데이터가 성공적으로 저장되었습니다.');
    } else {
        alert('비밀번호가 일치하지 않습니다.');
    }
}

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
    renderGroups();
}

// 사이트 블록 추가
function addSite(groupId, name = '', url = '') {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        const newName = prompt('사이트 이름을 입력하세요:', name || '새 사이트');
        if (newName !== null) {
            const newUrl = prompt('사이트 주소를 입력하세요:', url || 'https://');
            if (newUrl !== null) {
                group.sites.push({
                    id: Date.now(),
                    name: newName,
                    url: newUrl,
                    image: '',
                    width: 200,
                    height: 150
                });
                renderGroups();
            }
        }
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
                    // 이름과 URL은 바로 업데이트
                    site.name = newName;
                    site.url = newUrl;
                    
                    // 이미지 업로드 선택
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                site.image = event.target.result;
                                renderGroups();
                            };
                            reader.readAsDataURL(file);
                        } else {
                            // 이미지 업로드를 취소해도 이름과 URL은 변경된 상태 유지
                            renderGroups();
                        }
                    };
                    input.click();
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
        renderGroups();
    }
}

// 삭제 모드 토글
function toggleDeleteMode() {
    isDeleteMode = !isDeleteMode;
    document.getElementById('deleteModeButton').textContent = isDeleteMode ? '삭제 모드 종료' : '삭제 모드';
    renderGroups();
}

// 수정 모드 토글
function toggleEditMode() {
    isEditMode = !isEditMode;
    document.getElementById('editModeButton').textContent = isEditMode ? '수정 모드 종료' : '수정 모드';
    renderGroups();
}

// 사이트 클릭 시 새 창에서 열기
function openSite(url) {
    if (!isDeleteMode && !isEditMode) {  // 수정 모드가 아닐 때만 링크 열기
        window.location.href = url;  // 현재 탭에서 열기
    }
}

// 그룹 이름 수정
function editGroup(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        const newName = prompt('그룹 이름을 입력하세요:', group.name);
        if (newName !== null) {
            group.name = newName;
            renderGroups();
        }
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
                <div class="group-title" onclick="editGroup(${group.id})">${group.name}</div>
                <div class="group-controls">
                    <button class="icon-button add-site" onclick="addSite(${group.id})" title="사이트 추가">+</button>
                    <button class="icon-button delete-group" onclick="deleteGroup(${group.id})" title="그룹 삭제">-</button>
                </div>
            </div>
            <div class="sites-container" data-group-id="${group.id}">
                ${group.sites.map(site => {
                    return `
                        <div class="site-block" 
                             draggable="true" 
                             data-site-id="${site.id}" 
                             onclick="${isEditMode ? `editSite(${group.id}, ${site.id})` : `openSite('${site.url}')`}"
                             style="width: ${site.width}px; height: ${site.height}px">
                            <div class="site-image" style="background-image: url('${site.image}')">
                                <div class="site-name">${site.name}</div>
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
        renderGroups();
    }
}

// 초기 로드
loadData();

// 저장 버튼 이벤트 리스너 추가
document.getElementById('saveButton').addEventListener('click', () => {
    saveData();
}); 