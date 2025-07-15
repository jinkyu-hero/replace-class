// ⚠️ 중요: 1단계에서 복사한 구글 시트 '웹에 게시' URL을 아래에 붙여넣으세요.
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTEazyRaycK6OachA3y-WRv3VAED6C47hEJqAWzgvL_Oyk3xkSftjoQQBSu108iYQwpwkHMcYM8940m/pub?gid=0&single=true&output=csv';

// HTML 요소 가져오기
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsBody = document.getElementById('resultsBody');
const statusMessage = document.getElementById('statusMessage');
const tableHeaders = ['날짜', '교시', '학반', '과목', '입실교사', '비고', '교사'];

let sheetData = []; // 구글 시트 데이터를 저장할 배열

// 구글 시트에서 CSV 데이터 불러오기
async function fetchSheetData() {
  try {
    const response = await fetch(GOOGLE_SHEET_URL);
    if (!response.ok) {
      throw new Error('네트워크 응답이 올바르지 않습니다.');
    }
    const csvText = await response.text();
    parseCSV(csvText);
    statusMessage.textContent = '데이터 로딩 완료! 검색을 시작하세요.';
  } catch (error) {
    console.error('데이터를 불러오는 중 오류 발생:', error);
    statusMessage.textContent = '데이터를 불러오는 데 실패했습니다. URL을 확인해주세요.';
  }
}

// CSV 텍스트를 객체 배열로 변환
function parseCSV(csvText) {
  const rows = csvText.trim().split('\n');
  const headers = rows.shift().split(','); // 첫 행은 헤더로 사용

  sheetData = rows.map(rowStr => {
    const values = rowStr.split(',');
    const rowObject = {};
    headers.forEach((header, index) => {
      rowObject[header.trim()] = values[index] ? values[index].trim() : '';
    });
    return rowObject;
  });
}

// 결과를 테이블에 표시하는 함수
function displayResults(data) {
  resultsBody.innerHTML = ''; // 기존 결과 초기화

  if (data.length === 0) {
    statusMessage.textContent = '검색 결과가 없습니다.';
    return;
  }
  
  statusMessage.textContent = `${data.length}개의 결과를 찾았습니다.`;

  data.forEach(row => {
    const tr = document.createElement('tr');
    
    // 정의된 헤더 순서대로 셀을 추가
    tableHeaders.forEach(header => {
        const td = document.createElement('td');
        td.textContent = row[header] || ''; // 데이터가 없는 경우 빈 문자열
        tr.appendChild(td);
    });
    
    resultsBody.appendChild(tr);
  });
}

// 검색 실행 함수
function performSearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (!searchTerm) {
    displayResults(sheetData); // 검색어가 없으면 전체 데이터 표시
    statusMessage.textContent = '전체 데이터가 표시됩니다. 검색어를 입력해주세요.';
    return;
  }

  const filteredData = sheetData.filter(row => {
    // '입실교사' 열의 값이 검색어를 포함하는지 확인
    return row['입실교사'] && row['입실교사'].toLowerCase().includes(searchTerm);
  });

  displayResults(filteredData);
}

// 이벤트 리스너 설정
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    performSearch();
  }
});

// 페이지 로드 시 데이터 불러오기
document.addEventListener('DOMContentLoaded', fetchSheetData);