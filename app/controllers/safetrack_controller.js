
export const sendText = (req, res) => {
  
  console.log('gonna send a text');
  console.log(req.body);
  const number = req.body.toPhoneNumber; 
  const message = req.body.message;
  res.json(message); 
};

export const something = 5;
