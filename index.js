const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const {auth} = require('./middleware/auth');
const {User} = require("./models/User");
const config = require('./config/key');
const cookieParser = require('cookie-parser');

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
//application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))




app.get('/', (req, res) => {
  res.send('Hello World! 즐기자 인생뭐있냐 한번사는거')
}) 

app.post('/register', (req,res) => {
  
  //회원 가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
  const user = new User(req.body) //왜 이런 코드를 넣어야하지? json내용을 객체에 담아야 해서?
  user.save((err, doc) => {
    if (err) return res.json({ success: false, err})
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/login', (req, res) =>{

  //요청된 이메일을 데이터베이스에서 찾는다.
  User.findOne({email: req.body.email}, (err, user) => {
    if(!user){
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당되는 유저가 없습니다."
      })
    }
    //요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch)
        return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})
      
        //비밀번호 맞다면 토큰을 생성하기
      user.generateToken((err,user) => {
        if(err) return res.status(400).send(err);

        //토큰을 저장한다. 어디에? 쿠키 로컬스토리지
        res.cookie("x_auth", user.token)
        .status(200)
        .json({ loginSuccess: true, userID: user._id})
      })
    })
  })
})

//로그인 하지 않은 사용자에겐 토큰이 없다. 따라서 토근을 DB토큰과 비교하는 이유는 단순히 토큰이 있다 없다로 구분을 하면 로그인 하지 않은 유저가 악의적으로 토큰을 들고오면 로그인유저로 처리되기 때문이다. 즉 로그인한 유저의 토근이 진짜 그 사람의 토큰이 맞는지 확인하기 위해서이다. 
app.get('/api/users/auth', auth, (req,res) => {

  //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True라는 말.
  //정보를 주면 어떤 페이지에서든지 유저 정보를 이용할 수 있기 때문에 편하다.
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
   })
})
  
app.get('/api/users/logout', auth, (req, res) => {

  User.findOneAndUpdate({_id: req.user._id},
    {token: ""},
    (err, user) => {
    if (err) return res.json({success: false, err})
    return res.status(200).send({success: true})
    }
  )
})


  



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})