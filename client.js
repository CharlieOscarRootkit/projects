const url = "http://127.0.0.1:8080/";

const getData = async (url) => {
    try {
        const response = await fetch(url);
        const data = await response.text();
        console.log(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

const postData = async (url) => {
    try {
        const response = await fetch(`${url}sign-in`,
        {
            method:"POST",
            header:{
                "Content-Type":"application/json"
            },
            body:{
                username:"charlie",
                email:"charlieoscar@gmail.com",
                password:"michealStone"
            }
    }
        )

        console.log(response.json)
    } catch (error){
        console.error("Error posting data:", error);
    }
}
postData(url);
