import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// CLOVA API를 호출하는 함수 정의
async function analyzeSentiment(req: NextApiRequest, res: NextApiResponse) {
  let paths = [];
  // CLOVA API endpoint
  const url = 'https://naveropenapi.apigw.ntruss.com/sentiment-analysis/v1/analyze';
    
  // Request headers
  const headers = {
    'Content-Type': 'application/json',
    'X-NCP-APIGW-API-KEY-ID': 'vqj6uoarmt',
    'X-NCP-APIGW-API-KEY': 'lRV3ocnOR1lbPkihV34iTM64LQGvh8yzMEZU3pyM',
  };

  // Request body
  const data = JSON.stringify({
    "content": req.query.query,
    "config.negativeClassification": true,
  });

  try {
    // API 요청
    const response = await axios.post(url, data, { headers });
    if(response.status === 200){
      console.log(response.data);
      res.status(200).json(response.data);  // Response to client
    }else{
      console.error("Error: ", response.data);
      res.status(500).json({ error: 'Server Error' });  // Response to client with error
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default analyzeSentiment;
