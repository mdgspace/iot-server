document.getElementById("sendMsg").addEventListener("click", async function() 
{
    let data = await axios.get('/api/message/sendMsg');
})