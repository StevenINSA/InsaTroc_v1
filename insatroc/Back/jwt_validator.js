const jwt =require('jsonwebtoken');

const validator = (req,res,next) => {
    try {
        console.log(66);
        //console.log(req.headers);
        const token = req.headers.authorization;
        console.log(token);
        jwt.verify(token,'privateKey')
        next();
    } catch {
        res.status(401).json({response:"Failed !"});
    }

}
module.exports = validator