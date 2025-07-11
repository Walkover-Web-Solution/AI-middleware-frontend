let callCount = 0;
const maxCalls = 40;
const interval = 4000; // 3 seconds

function callAPI() {
  fetch('https://dev-api.gtwy.ai/api/v2/model/chat/completion', {
    method: 'POST',
    headers: {
      'pauthkey': 'b6ab5302f079beea95a1890074de2493',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user: "YOUR_USER_QUESTION",
      agent_id: "6864da233a7815b07b4e63dd",
    
      response_type: "text",
      variables: {}
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log(`Call ${callCount + 1} response:`, data);
  })
  .catch(error => {
    console.error(`Call ${callCount + 1} error:`, error);
  });

  callCount++;
  if (callCount >= maxCalls) {
    clearInterval(intervalId);
  }
}

const intervalId = setInterval(callAPI, interval);