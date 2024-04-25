const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");

//Aqui tienen una forma de llamar a cada uno de los modelos
const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
// const Movies = db.Movie;
// const Genres = db.Genre;
// const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    add: function (req, res) {
        db.Genre.findAll()
        .then(genres =>{
            res.render("moviesAdd",{allGenres:genres})
        }).catch(err=>console.log(err))
        
    },
    create: function (req,res) {
        const {title, rating, number, awards, release_date, length, genre_id} = req.body
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            db.Genre.findAll()
        .then(genres =>{
            res.render("moviesAdd",{errors:errors.mapped(),old:req.body, allGenres:genres})
        }).catch(err=>console.log(err))

        }else{
        
        db.Movie.create({
            title: title.trim(),
            rating: rating,
            awards,
            release_date,
            length,
            genre_id
        })
        .then((movie)=>{
            res.redirect("/movies")
        })
        .catch(err=>console.log(err))
        }
    },
    edit: function(req,res) {
        const {id} = req.params
        const requestedMovie = db.Movie.findByPk(id, {include: ['genre','actors']}).catch(err=>console.log(err))
        const allGenres = db.Genre.findAll().catch(err=>console.log(err))

        Promise.all([requestedMovie, allGenres])
        .then(([movie,genres])=>{
            
            res.render("moviesEdit",{Movie:movie, allGenres:genres})
        }).catch(err=>console.log(err))

    },
    update: function (req,res) {
        const {id} = req.params
        const {title,rating,awards,release_date,length,genre_id} = req.body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const requestedMovie = db.Movie.findByPk(id, 
                { include:[{
                association:"genres_movie"
                }
            ]}
            ).catch(err=>console.log(err))
            const allGenres = db.Genre.findAll().catch(err=>console.log(err))
    
            Promise.all([requestedMovie, allGenres])
            .then(([movie,genres])=>{
            res.render("moviesEdit", {errors:errors.mapped(),old:req.body, Movie:movie, allGenres:genres})
             }).catch(err=>console.log(err))
        }else{
        db.Movie.update({
            title: title.trim(),
            rating: rating,
            awards,
            release_date,
            length,
            genre_id
        },{
            where: {id}
        }).then(movie=>{
            res.redirect("/movies")
        }).catch(err=>console.log(err));
        
    }
    },
    delete: function (req,res) {
        const {id} = req.params
        db.Movie.findByPk(id)
        .then((resp)=>{
            res.render("moviesDelete", {Movie:resp})
        })
        .catch(err=>console.log(err))
    },
    destroy: function (req,res) {
        const {id} = req.params
        db.Movie.destroy({
            where:{
                id
            }
        }).then(resp=>{
            res.redirect("/movies")
        }).catch(err=>console.log(err))
        
    }
}

module.exports = moviesController;