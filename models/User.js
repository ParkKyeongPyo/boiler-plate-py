const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name : {
        type : String,
        maxlength : 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }

}) 

userSchema.pre('save', function( next ){
    var user = this;

    if(user.isModified('password')){
        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err) return next(err)

            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err)
                user.password = hash
                next();
            });
        });
    } else {
        next();
    }
})

userSchema.methods.comparePassword = function (plainPassword, cb) {

    bcrypt.compare(plainPassword, this.password, function(err, isMatch){

        if(err) return cb(err)
        cb(null, isMatch)       
    })
}

userSchema.methods.generateToken = function(cb){

    var user = this;

    // jsonwebtoken을 이용해서 토큰을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken');

    user.token = token;
    user.save(function(err,user){
        if(err) return cb(err)
        cb(null,user)
    })

}
//methods와 statics의 차이는 정적 메소드 개념? 정적 메소드는 인스턴스를 생성하지 않고도 메소드 사용할 수 있다. 모델을 생성하지 않고도 메소드를 사용하기위해 사용
userSchema.statics.findByToken = function (token, cb){
    var user = this;

    //토큰을 decode한다.
    jwt.verify(token,  'secretToken', function(err, decoded){
        //유저 아이드를 이용해서 유저를 찾은 다음에
        //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
        user.findOne({"_id": decoded, "token": token}, function(err, user){
            if(err) return cb(err)
            cb(null, user)


        })



    })
}

const User = mongoose.model('User', userSchema)

module.exports = {User}