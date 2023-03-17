const Food = require('../models/Food')
const {getFoodByName} = require('../controllers/foodsControllers')
const { uploadImage, deleteImage } = require('../libs/cloudinary');
const fs = require('fs-extra')

const getFoods = async (req, res) => {
    try {
        const {name} = req.query;
        const results = name
        ? await getFoodByName(name)
        : await Food.find();
        res.status(200).send(results);
    } 
    catch (error) {
        res.status(400).send(error.message);
    }
}

const getFoodById = async (req, res) => {
    const {id} = req.params;
    try {
        const foodById = await Food.findById(id);
        res.status(200).send(foodById);
    } 
    catch (error) {
        res.status(400).send(error.message)
    }
}

const createFood = async (req, res) => {
    try {
        const {name, price, description, category} = req.body;
        let image;
        if(req.files.image){
            const res = await uploadImage(req.files.image.tempFilePath);
            image = {
                url: res.secure_url,
                public_id: res.public_id
            };
            await fs.remove(req.files.image.tempFilePath)
        };


        const newFood = new Food({name, price, description, category, image });
        await newFood.save();
        res.status(201).send(newFood);
    } 
    catch (error) {
        console.log(error);
        res.status(404).send(error.message)
    }
}

const updateFood = async (req, res) => {
    try {
        const {id} = req.params;
        const {name, price, description, category} = req.body;
        console.log(req.files);
        let image;
        const currentFood = await Food.findById(id);
        if(req.files){
            if(req.files.image){
                await deleteImage(currentFood.image.public_id)
                const res = await uploadImage(req.files.image.tempFilePath);
                await fs.remove(req.files.image.tempFilePath)
                image = {
                    url: res.secure_url,
                    public_id: res.public_id
                };
            }
        };
        const preUpdatedFood = {
            name,
            price, 
            description, 
            image, 
            category
        };
        const updatedFood = await Food.updateOne({_id: id}, { $set: preUpdatedFood });
        res.status(200).send(updatedFood);
    } 
    catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

const deleteFood = async (req, res) => {
    const { id } = req.params
    try {
        const foodRemoved = await Food.findByIdAndDelete(id);
        await deleteImage(foodRemoved.image.public_id)
        res.status(200).send("se borro correctamente")
    } 
    catch (error) {
        res.status(404).send(error.message)
    }
}

module.exports = {
    getFoods,
    getFoodById,
    createFood,
    updateFood,
    deleteFood
}