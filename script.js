// ⚠️ 중요: 1단계에서 복사한 구글 시트 '웹에 게시' URL을 아래에 붙여넣으세요.
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTEazyRaycK6OachA3y-WRv3VAED6C47hEJqAWzgvL_Oyk3xkSftjoQQBSu108iYQwpwkHMcYM8940m/pub?gid=0&single=true&output=csv';

// HTML 요소 가져오기
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsBody = document.getElementById('resultsBody');
const statusMessage = document.getElementById('statusMessage');
const todayDateElement = document.getElementById('todayDate');

// 표시할 테이블 헤더
const tableHeaders = ['날짜', '교시', '학반', '과목', '입실교사', '비고'];

let sheetData = []; // 구글 시트 데이터를 저장할 배열

// 오늘 날짜를 YYYY-MM-DD 형식으로 포맷하는 함수
function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 구글 시트에서 CSV 데이터 불러오기
async function fetchSheetData() {
  try {
    const response = await fetch(GOOGLE_SHEET_URL);
    if (!response.ok) {
      throw new Error('네트워크 응답이 올바르지 않습니다.');
    }
    const csvText = await response.text();
    parseCSV(csvText);
    statusMessage.textContent = '데이터 로딩 완료!';
  } catch (error) {
    console.error('데이터를 불러오는 중 오류 발생:', error);
    statusMessage.textContent = '데이터를 불러오는 데 실패했습니다. URL을 확인해주세요.';
  }
}

// CSV 텍스트를 객체 배열로 변환
function parseCSV(csvText) {
  const rows = csvText.trim().split('\n');
  const headersFromSheet = rows.shift().split(',');

  sheetData = rows.map(rowStr => {
    const values = rowStr.split(',');
    const rowObject = {};
    headersFromSheet.forEach((header, index) => {
      if (header.trim() !== '교사') {
        rowObject[header.trim()] = values[index] ? values[index].trim() : '';
      }
    });
    return rowObject;
  });
}

// 결과를 테이블에 표시하는 함수
function displayResults(data) {
  resultsBody.innerHTML = ''; // 기존 결과 초기화

  if (data.length === 0) {
    statusMessage.textContent = '표시할 데이터가 없습니다.';
    return;
  }
  
  data.sort((a, b) => a['날짜'].localeCompare(b['날짜']) || a['교시'].localeCompare(b['교시']));

  data.forEach(row => {
    const tr = document.createElement('tr');
    tableHeaders.forEach(header => {
        const td = document.createElement('td');
        td.textContent = row[header] || '';
        tr.appendChild(td);
    });
    resultsBody.appendChild(tr);
  });
}

// 검색 실행 함수
function performSearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const todayString = getFormattedDate(today); // 'YYYY-MM-DD' 형식의 오늘 날짜

  let finalFilteredData;

  if (!searchTerm) {
    // ✅ 변경된 부분: 검색어가 없으면 오늘 날짜 데이터만 필터링
    finalFilteredData = sheetData.filter(row => row['날짜'] === todayString);
    statusMessage.textContent = `오늘(${todayString}) 전체 현황입니다.`;
  } else {
    // 검색어가 있으면 오늘 및 미래 날짜 중에서 이름으로 검색
    const dateFilteredData = sheetData.filter(row => {
        if (!row['날짜']) return false;
        const rowDate = new Date(row['날짜']);
        return rowDate >= today;
    });
    
    finalFilteredData = dateFilteredData.filter(row => {
      return row['입실교사'] && row['입실교사'].toLowerCase().includes(searchTerm);
    });
    statusMessage.textContent = `'${searchTerm}' 검색 결과: 총 ${finalFilteredData.length}건`;
  }

  displayResults(finalFilteredData);
}

// 이벤트 리스너 설정
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    performSearch();
  }
});

// 페이지가 처음 로드될 때 실행
document.addEventListener('DOMContentLoaded', async () => {
  const today = new Date();
  todayDateElement.textContent = `🗓️ Today: ${getFormattedDate(today)}`;
  
  await fetchSheetData(); 
  performSearch(); // 초기 로드 시 오늘 현황을 보여줌
});