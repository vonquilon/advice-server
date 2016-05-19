var mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    User = mongoose.model('User'),
    errHandler = require('../utils/errHandler'),
    strings = require('../utils/strings'),
    constants = require('../utils/constants');

exports.create = function(req, res) {
    User.findById(req.body.author, function(err, user) {
        errHandler.handleErr(err, res, function() {
            if (user && user.validateAccTok(req.get(strings.headerNames.accessToken))) {
                delete req.body.accessToken;

                var post = new Post(req.body);
                post.save(function(err) {
                    errHandler.handleErr(err, res, function() {
                        res.status(201).json(post);
                    });
                });
            } else {
                res.status(401).send(strings.statCode._401.unauthAcc);
            }
        });
    });
};

exports.getPosts = function(req, res) {
    var latitude = req.get(strings.headerNames.latitude),
        longitude = req.get(strings.headerNames.longitude),
        radius = req.get(strings.headerNames.radius);

    if (!(latitude >= -90 && latitude <= 90) || !(longitude >= -180 && longitude <= 180)) {
        res.status(400).send(strings.statCode._400.invalidGPSCoords);
    } else if (!(radius >= 5 && radius <= 10)) {
        res.status(400).send(strings.statCode._400.invalidRadius);
    } else {
        // TODO: get posts from database and simplify using Equirectangular approximation
        // TODO: exclude latitude and longitude from results and populate author
        // TODO: test getPosts function
        // 1 gps degree is about 69 miles
        var degrees = radius/constants.MILES_PER_DEGREE;
        Post.find({
            latitude: { $gte: latitude-degrees, $lte: latitude+degrees },
            longitude: { $gte: longitude-degrees, $lte: longitude+degrees }
        }).select('-latitude -longitude')
            .populate('author')
            .exec(function(err, posts) {
                errHandler.handleErr(err, res, function() {
                    console.log(posts);
                });
            });
    }
};