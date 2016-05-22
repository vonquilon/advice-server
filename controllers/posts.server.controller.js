var mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    User = mongoose.model('User'),
    errHandler = require('../utils/errHandler'),
    strings = require('../utils/strings'),
    constants = require('../utils/constants'),
    helperFuncs = require('../utils/helperFuncs');

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
        // convert strings to numbers
        latitude = latitude/1;
        longitude = longitude/1;
        radius = radius/1;
        // 1 gps degree is about 69 miles
        var degrees = radius/constants.MILES_PER_DEGREE;

        Post.find({
            latitude: { $gte: latitude-degrees, $lte: latitude+degrees },
            longitude: { $gte: longitude-degrees, $lte: longitude+degrees }
        }).populate('author', '_id')
            .exec(function(err, posts) {
                errHandler.handleErr(err, res, function() {
                    // simplify using Equirectangular approximation
                    var result = [],
                        radiusM = radius * constants.METERS_PER_MILE, // radius in meters
                        numOfPosts = posts.length;

                    for (var i = 0; i < numOfPosts; i++) {
                        var post = posts[i],
                            x = helperFuncs.degToRad(post.longitude-longitude) * Math.cos(helperFuncs.degToRad(post.latitude+latitude)/2),
                            y = helperFuncs.degToRad(post.latitude - latitude),
                            d = Math.sqrt(x*x + y*y) * constants.EARTH_R_M;

                        if (d <= radiusM) {
                            result.push(post.clean());
                        }
                    }
                    res.status(200).json(result);
                });
            });
    }
};