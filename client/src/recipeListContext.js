import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const RecipeListContext = React.createContext();


const API_KEY = process.env.REACT_APP_API_KEY;
// const API_KEY = "439cc1dd2b1746cfb48ea9a80a72a868"





function RecipeListContextProvider(props) {
  const navigate = useNavigate();
  const count = useRef(0);
  const [users, setUsers] = useState([]);
  const [listData, setListData] = useState([]);
  const [offset, setOffset] = useState(0);
  const [pageCount, setPageCount] = useState(0);
const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    search: "",
    cuisine: "",
    diet: "",
    intolerances: "",
  });
  const [oneRecipe, setOneRecipe] = useState({});
  const [savedRecipesList, setSavedRecipesList] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);    // this has all of the recipes for all users.  Use this to filter recipes by userId



  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        [name]: value,
      };
    });
  }

  function handlePageClick(data) {
    setOffset(data.selected * recipesPerPage)

  }




  //THIS GETS THE USER/RECIPEINFO WHEN STARTING
  useEffect(() => {       
    setLoading(true)                            
    axios.get("https://mealplanner-backend.onrender.com/users").then((res) => {
      setLoading(false)
    
    setUsers((prev) => res.data)
 }
    );
    axios.get("https://mealplanner-backend.onrender.com/recipes").then((res) =>{ 
      setLoading(false)
    setSavedRecipes(res.data)
  }
    );
    count.current = count.current + 1; 
    }, [])





  //NUMBER OF RESULTS WANTED PER PAGE
  const recipesPerPage = 9;

  //MAKES PAGE NUMBER NOT BECOME THE ORIGINAL STATE OF 0 WHEN A USER LOADS OR REFRESHES THE PAGE
  useEffect(() => {
    getNumberOfPages()
  }, [offset])

  useEffect(() => {
 
    axios
      .get(
        `https://api.spoonacular.com/recipes/complexSearch?query=${formData.search}&cuisine=${formData.cuisine}&diet=${formData.diet}&intolerances=${formData.intolerances}&number=${recipesPerPage}&offset=${offset}&apiKey=${API_KEY}`
      )
      .then((response) => setListData(response.data.results))
      .catch((error) => console.log(error));
  }, [offset]);

  // FOR SETTING THE CORRECT AMOUNT OF PAGES DISPLAYED FOR THE USER
  function getNumberOfPages () {
    axios
      .get(
        `https://api.spoonacular.com/recipes/complexSearch?query=${formData.search}&cuisine=${formData.cuisine}&diet=${formData.diet}&intolerances=${formData.intolerances}&apiKey=${API_KEY}`
      )
      .then((response) => setPageCount(response.data.totalResults))
      .catch((error) => console.log(error));
  };

  


  function getSearchResults() {


    setLoading(true)
    axios
      .get(
        `https://api.spoonacular.com/recipes/complexSearch?query=${formData.search}&cuisine=${formData.cuisine}&diet=${formData.diet}&intolerances=${formData.intolerances}&number=${recipesPerPage}&apiKey=${API_KEY}`
      )
      .then((response) => setListData(response.data.results))
      .then(res=>setLoading(false))
      .catch((error) => {
        setLoading(false)
        console.log(error)});
  }

  function handleSubmit(event) {

   
    {!loading &&
    event.preventDefault();
    getSearchResults();
    getNumberOfPages();
    navigate("/returned-recipes");}
    {loading && console.log("still loading ")}


    // need to add in here a way to clear the search form back to blank
  }



  function saveUserRecipe(userId, recId, img, title) {
    setLoading(true)


    const postedRecipe = {
      recipeId: recId,
      recipeImg: img,
      recipeTitle: title,
    };


    axios
      .post(`https://mealplanner-backend.onrender.com/recipes/${userId}`, postedRecipe)
      .then((res) => console.log(res.data));
    navigate("/");
  }

  function getRecipeDetails(id) {  
    setLoading(true)                            
    axios.get("https://mealplanner-backend.onrender.com/users").then((res) => setLoading(false)
    .catch(err=>setLoading(false))
    );
    console.log(loading)
    
    axios
      .get(
        `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${API_KEY}`
      )
      .then((response) => setOneRecipe(response.data))
     
      .catch((error) => {
        
        console.log(error)});
  }


 


  return (
    <RecipeListContext.Provider
      value={{
        loading,
        users,
        listData,
        formData,
        handleChange,
        handleSubmit,
        oneRecipe,
        getRecipeDetails,
        saveUserRecipe,
        count,
        handlePageClick,
        pageCount,
        recipesPerPage,
        savedRecipesList,
        setSavedRecipesList,       
        savedRecipes,
        API_KEY

      }}
    >
      {props.children}
    </RecipeListContext.Provider>
  );
}

export { RecipeListContext, RecipeListContextProvider };
