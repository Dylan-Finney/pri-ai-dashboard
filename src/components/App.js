/* eslint-disable react/no-unescaped-entities */
import { Box, Button, ButtonGroup, Flex, Grid, GridItem, Input, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverTrigger, Portal, Select, SimpleGrid, Spacer, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import axios from "axios"
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import PieChart from "./PieChart";
import DonutChart from "./DonutChart";
import world from "./countries-50m.json"
import us from "./counties-albers-10m.json"
import * as topojson from "topojson-client";
import Choropleth from "./Choropleth";
import BarChart from "./BarChart";
import Calendar from "./Calendar";
import { Select as MultiSelect } from "chakra-react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactPaginate from 'react-paginate';``
import { ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons'

import { appIcons } from '../assets/apps';
import CompareBadge from "./compareBadge";


function App(props) {
    const piRef = useRef(null)
    const worldRef = useRef(null)
    const jobRef = useRef(null)
    const calRef = useRef(null)
    const categoryRef = useRef(null)
    const chosenAppsRef = useRef(null)
    var countries = topojson.feature(world, world.objects.countries)
    var countrymesh = topojson.mesh(world, world.objects.countries, (a, b) => a !== b)
    var rename = new Map([["United States", "United States of America"]])
    var states = topojson.feature(us, us.objects.states)
    var statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b)
    var namemap = new Map(states.features.map(d => [d.properties.name, d.id]))

    const apps = [{"name": "23andMe", "tags": ["Misc"]},{"name": "Airbnb", "tags": ["Misc"]},{"name": "Amazon", "tags": ["Misc"]},{"name": "Ancestry", "tags": ["Misc"]}, {"name": "Apple Health", "tags": ["Health"]}, {"name": "Bosch", "tags": ["Health"]}, {"name": "Doordash", "tags": ["Misc"]}, {"name": "Evernote", "tags": ["Misc"]}, {"name": "Facebook", "tags": ["Social"]}, {"name": "Fitbit", "tags": ["Health"]}, {"name": "Google Calendar", "tags": ["Misc"]}, {"name": "Google Maps", "tags": ["Transport"]}, {"name": "Google", "tags": ["Misc"]}, {"name": "Instacart", "tags": ["Misc"]}, {"name": "Instagram", "tags": ["Social"]}, {"name": "iTunes", "tags": ["Social"]}, {"name": "Linkedin", "tags": ["Social"]}, {"name": "Lyft", "tags": ["Transport"]}, {"name": "Maps", "tags": ["Transport"]}, {"name": "Medium", "tags": ["Social"]}, {"name": "Netflix", "tags": ["Social"]}, {"name": "Notion", "tags": ["Misc"]}, {"name": "Oura", "tags": ["Health"]}, {"name": "Peloton", "tags": ["Health"]}, {"name": "Polar", "tags": ["Health"]}, {"name": "Prime Video", "tags": ["Social"]}, {"name": "Reddit", "tags": ["Social"]}, {"name": "Runkeeper", "tags": ["Health"]}, {"name": "Snapchat", "tags": ["Social"]}, {"name": "Spotify", "tags": ["Social"]}, {"name": "Strava", "tags": ["Health"]}, {"name": "Suunto", "tags": ["Health"]}, {"name": "Tiktok", "tags": ["Social"]}, {"name": "Tripadvisor", "tags": ["Misc"]}, {"name": "Twitch", "tags": ["Social"]}, {"name": "Twitter", "tags": ["Social"]}, {"name": "Uber Eats", "tags": ["Misc"]}, {"name": "Uber", "tags": ["Transport"]}, {"name": "Waze", "tags": ["Transport"]}, {"name": "Withings", "tags": ["Health"]}, {"name": "Youtube", "tags": ["Social"]}]
    const filterAppsOptions = [{"label": "23andMe","value": "23andMe"},{"label": "Airbnb","value": "Airbnb"},{"label": "Amazon","value": "Amazon"},{"label": "Ancestry","value": "Ancestry"}, {"label": "Apple Health","value": "Apple Health"}, {"label": "Bosch","value": "Bosch"}, {"label": "Doordash","value": "Doordash"}, {"label": "Evernote","value": "Evernote"}, {"label": "Facebook","value": "Facebook"}, {"label": "Fitbit","value": "Fitbit"}, {"label": "Google Calendar","value": "Google Calendar"}, {"label": "Google Maps","value": "Google Maps"}, {"label": "Google","value": "Google"}, {"label": "Instacart","value": "Instacart"}, {"label": "Instagram","value": "Instagram"}, {"label": "iTunes","value": "iTunes"}, {"label": "Linkedin","value": "Linkedin"}, {"label": "Lyft","value": "Lyft"}, {"label": "Maps","value": "Maps"}, {"label": "Medium","value": "Medium"}, {"label": "Netflix","value": "Netflix"}, {"label": "Notion","value": "Notion"}, {"label": "Oura","value": "Oura"}, {"label": "Peloton","value": "Peloton"}, {"label": "Polar","value": "Polar"}, {"label": "Prime Video","value": "Prime Video"}, {"label": "Reddit","value": "Reddit"}, {"label": "Runkeeper","value": "Runkeeper"}, {"label": "Snapchat","value": "Snapchat"}, {"label": "Spotify","value": "Spotify"}, {"label": "Strava","value": "Strava"}, {"label": "Suunto","value": "Suunto"}, {"label": "Tiktok","value": "Tiktok"}, {"label": "Tripadvisor","value": "Tripadvisor"}, {"label": "Twitch","value": "Twitch"}, {"label": "Twitter","value": "Twitter"}, {"label": "Uber Eats","value": "Uber Eats"}, {"label": "Uber","value": "Uber"}, {"label": "Waze","value": "Waze"}, {"label": "Withings","value": "Withings"}, {"label": "Youtube","value": "Youtube"}]
    // const chosenAppsFilter = {
    //     apps: [],
    //     tags: []
    // }
    const [chosenAppsFilter, setChosenAppsFilter] = useState({
        apps: [],
        tags: []
    })
    const initialFocusRef = useRef()
    const [excludeNoFeedback, setExcludeNoFeedback] = useState(false)
    const [refreshDate, setRefreshDate] = useState(null)
    const [excludeNoCategory, setExcludeNoCategory] = useState(false)
    const [dateButton, setDateButton] = useState("All time")
    const [data, setData] = useState([])
    const [promptTotal, setPromptTotal] = useState(0)
    const [allExchanges, setAllExchanges] = useState([])
    const [fetchingData, setFetchingData] = useState(false)
    const [promptFeedbackView, setPromptFeedbackView] = useState({feedback:[], category:[], job:[], apps:[], dataSources:[]})
    const [promptDataSourceViewUnion, setPromptDataSourceViewUnion] = useState(false)
    const [calData, setCalData] = useState([])
    const [avgConvoLength, setAvgConvoLength] = useState(0)
    const [convoTotal, setConvoTotal] = useState(0)
    const [countryUsers, setCountryUsers] = useState([])
    const [regionUsers, setRegionUsers] = useState([])
    const [categoryData, setCategoryData] = useState([])
    const [helpfulCount, setHelpfulCount] = useState([])
    const [jobs, setJobs] = useState([])
    const [chosenAppsData, setChosenAppsData] = useState([])
    const [categorySort, setCategorySort] = useState("value desc")
    const [mapView, setMapView] = useState("world")
    const [calView, setCalView] = useState("totalConvos")
    const [calDifference, setCalDifference] = useState(false)
    const [excludeNoChosenApps, setExcludeNoChosenApps] = useState(true)
    const [excludeNoJob, setExcludeNoJob] = useState(true)
    const [analysisDate, setAnalysisDate] = useState({start: new Date(), end:null})
    const [useDate, setUseDate] = useState(false)
    const [showFilter, setShowFilter] = useState(false)
    const [useRange, setUseRange] = useState(false)
    const [promptSearch, setPromptSearch] = useState("")
    const [promptRange, setPromptRange] = useState(0)
    const [promptAnalysisRange, setPromptAnalysisRange] = useState({start: 0, end: 0})
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const [categoryColors, setCategoryColors] = useState({})
    const [appsSum, setAppsSum] = useState([])
    const [helpfulColors, setHelpfulColors] = useState({})
    // const [data, feedback] = useState([])

    useEffect(()=>{
        getData()
    },[])

    const getData =  async () => {
        setFetchingData(true)
        try{
            const response = await axios({
                method: "GET",
                url: "/api/refresh"
            })
            setData(response.data.data)
            setRefreshDate(new Date())
            // console.log(response.data.datalo)
        } catch(e){
            console.error("UNABLE TO GET DATA")
        }
        setFetchingData(false)
        
    }

    const getAppLogo = (app) => {
        switch(app){
          case "23andMe":
            return appIcons._23andme
          case "Airbnb":
            return appIcons.airbnb
          case "Amazon":
            return appIcons.amazon
          case "Ancestry":
            return appIcons.ancestry
          case "Apple Health":
            return appIcons.appleHealth
          case "Bosch":
            return appIcons.bosch
          case "Doordash":
            return appIcons.doordash
          case "Evernote":
            return appIcons.evernote
          case "Facebook":
            return appIcons.facebook
          case "Fitbit":
            return appIcons.fitbit
          case "Google Calendar":
            return appIcons.googleCal
          case "Google Maps":
            return appIcons.googleMaps
          case "Google":
            return appIcons.google
          case "Instacart":
            return appIcons.instacart
          case "Instagram":
            return appIcons.instagram
          case "iTunes":
            return appIcons.itunes
          case "Linkedin":
            return appIcons.linkedin
          case "Lyft":
            return appIcons.lyft
          case "Maps":
            return appIcons.maps
          case "Medium":
            return appIcons.medium
          case "Movesense":
            return appIcons.movesense
          case "Netflix":
            return appIcons.netflix
          case "Notion":
            return appIcons.notion
          case "Oura":
            return appIcons.oura
          case "Peloton":
            return appIcons.peloton
          case "Polar":
            return appIcons.polar
          case "Prime Video":
            return appIcons.primeVideo
          case "Reddit":
            return appIcons.reddit
          case "Runkeeper":
            return appIcons.runkeeper
          case "Snapchat":
            return appIcons.snapchat
          case "Spotify":
            return appIcons.spotify
          case "Strava":
            return appIcons.strava
          case "Suunto":
            return appIcons.suunto
          case "Tiktok":
            return appIcons.tiktok
          case "Tripadvisor":
            return appIcons.tripadvisor
          case "Twitch":
            return appIcons.twitch
          case "Twitter":
            return appIcons.twitter
          case "Uber Eats":
            return appIcons.uberEats
          case "Uber":
            return appIcons.uber
          case "Waze":
            return appIcons.waze
          case "Withings":
            return appIcons.withings
          case "Youtube":
            return appIcons.youtube
          default:
            return ""
        }
      }
    useEffect(()=>{
        function processData(analysisDate){
            var helpful = [{name: "Helpful", value: 0},{name: "Unhelpful", value: 0},{name: "No feedback", value: 0}]
            var jobTotal = 0
            var convoTotal = 0
            var appTotal = 0
            var promptTotal = 0
            var usersAppsAdded = 0
            var countryCount = {}
            var regionCount = {}
            var jobCount = {}
            var calCount = {}
            var appCount = {}
            var categoryCount = {}
            var categoryData = []
            var countryData = []
            var regionData = []
            var jobData = []
            var calData = []
            var appData = []
            var appsSum = {}
            var convoLength = 0
            var promptAppSum = []
            var dataTemp = data
            if (useDate){
                if (analysisDate.end !== null){
                    dataTemp = data.filter(user=>{
                        const d1 = new Date(user.createdAt)
                        return d1.getTime() > analysisDate.end.getTime() && d1.getTime() < (analysisDate.start.getTime()); 
                    })
                } else {
                    dataTemp = data.filter(user=>{
                        const d1 = new Date(user.createdAt)
                        // console.log({a: d1.toDateString(), b: analysisDate.start.toDateString()})
                        return d1.toDateString() === analysisDate.start.toDateString(); 
                    })
                }
            }
            var exchanges = []
            dataTemp.map(user=>{
                var addApps = false
                var convoDateObj = new Date(user.createdAt)
                var dateStr = `${convoDateObj.getUTCFullYear()}-${('0' + (convoDateObj.getMonth()+1)).slice(-2)}-${('0' + convoDateObj.getDate()).slice(-2)}`
                if (calCount[dateStr] === undefined){
                    calCount[dateStr] = {
                        totalConvos: 0,
                        totalExchanges: 0
                    }
                }
                calCount[dateStr].totalConvos++;
                // Helpful
                user.exchanges.map(exchange=>{
                    promptTotal++;
                    var dataSources = []
                    var exchangeTemp = exchange
                    switch(exchange.helpful){
                        case true:
                            // console.log(exchange)
                            helpful[0].value++;
                            break
                        case false:
                            helpful[1].value++;
                            break
                        case null:
                        default:
                            helpful[2].value++;
                            break
                    }
                    apps.map(val=>val.name).forEach((value)=>{
                        if (exchange.prompt.toLowerCase().search(value.toLowerCase())>-1){
                            if (appsSum[value] === undefined){
                                appsSum[value] = 0
                            }
                            appsSum[value]++
                            dataSources.push(value)
                        }
                    })

                    if (exchange.category === undefined){
                        if (categoryCount["None"] === undefined){
                            categoryCount["None"] = 0
                        }
                        exchange["category"] = "None"
                        categoryCount["None"]++
                    } else {
                        if (categoryCount[exchange.category] === undefined){
                            categoryCount[exchange.category] = 0
                        }
                        categoryCount[exchange.category]++
                    }
                    
                    exchange["country"] = user.country
                    exchange["region"] = user.region
                    exchange["job"] = user.job ? user.job.trim().toLowerCase() : "None"
                    exchange["chosenApps"] = user.chosenApps ? user.chosenApps : []
                    exchange["dataSources"] = dataSources
                    // var exchangeTemp = exchange
                    exchanges.push(exchangeTemp)

                    
                })
                user.chosenApps.forEach(element => {
                    if (appCount[element] === undefined){
                        appCount[element] = 0
                    }
                    appCount[element]++;
                    appTotal++;
                    if (!addApps){
                        usersAppsAdded++
                        addApps = true
                    }
                });
                
                calCount[dateStr].totalExchanges+=user.exchanges.length
                convoLength+=user.exchanges.length
                convoTotal++
                //Country Count
                if (countryCount[user.country] === undefined){
                    countryCount[user.country] = 0
                    regionCount[user.country] = {}
                    regionCount[user.country][user.region] = 0
                } else if (regionCount[user.country][user.region] === undefined) {
                    regionCount[user.country][user.region] = 0
                }
                const job = user.job ? user.job.trim().toLowerCase() : "None"
                if (jobCount[job] === undefined){
                    jobCount[job] = 0
                }
                countryCount[user.country]++;
                regionCount[user.country][user.region]++;
                jobCount[job]++;
                jobTotal++
            })
            Object.keys(countryCount).map((country)=>{
                countryData.push({name: rename.get(country) || country, users: countryCount[country]})
                if (regionData[country] === undefined){
                    regionData[country] = []
                }
                Object.keys(regionCount[country]).map((region)=>{
                    regionData.push({name: region, users: regionCount[country][region]})
                })
            })
            Object.keys(jobCount).map((job)=>{
                jobData.push({name: job, frequency: jobCount[job]})
            })
            Object.keys(calCount).map((calDate)=>{
                calData.push({date: new Date(calDate), avgExchanges: calCount[calDate].totalExchanges/calCount[calDate].totalConvos,...calCount[calDate]})
            })
            Object.keys(appCount).map((app)=>{
                appData.push({name: app, frequency: appCount[app]/usersAppsAdded})
            })
            Object.keys(categoryCount).map((category)=>{
                categoryData.push({name: category, value: categoryCount[category]})
            })
            Object.keys(appsSum).map((app)=>{
                promptAppSum.push({name: app, value: appsSum[app]})
            })

            calData = calData.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB;
            });
            var calArray = [];

            for (let i = 0; i < calData.length - 1; i++) {
                const currentDate = new Date(calData[i].date);
                const nextDate = new Date(calData[i+1].date);

                const daysBetween = Math.floor((nextDate - currentDate) / (1000 * 60 * 60 * 24));

                calArray.push(calData[i]);

                for (let j = 1; j < daysBetween; j++) {
                    const newDate = new Date(currentDate.getTime() + j * (1000 * 60 * 60 * 24));
                    const newObject = { date: newDate, avgExchanges: 0, totalConvos: 0, totalExchanges:0 }; // create new object with date string in "YYYY-MM-DD" format
                    calArray.push(newObject);
                }
            }
            calArray.push(calData[calData.length - 1]);
            return {
                countryData,
                regionData,
                helpful,
                jobData,
                "avgConvoLength": convoLength/dataTemp.length,
                convoLength,
                calArray,
                promptTotal,
                appData,
                categoryData,
                exchanges,
                promptAppSum,
                convoTotal


            }
        }
        if (useDate && dateButton !== "Custom"){
            const processedData = processData(analysisDate)
            var processedData2
            var analysisDate2 = {}
            analysisDate2.start = new Date(analysisDate.start)
            analysisDate2.end = new Date(analysisDate.end)
            console.log("",analysisDate2)
            console.log(analysisDate.end.getTime())
            switch(dateButton){
                case "7 days":
                    analysisDate2.start = new Date(analysisDate2.start.setDate(analysisDate2.start.getDate()-7))
                    analysisDate2.end = new Date(analysisDate2.end.setDate(analysisDate2.end.getDate()-7))
                    processedData2 = processData(analysisDate2)
                    break
                case "14 days":
                    analysisDate2.start = new Date(analysisDate2.start.setDate(analysisDate2.start.getDate()-14))
                    analysisDate2.end = new Date(analysisDate2.end.setDate(analysisDate2.end.getDate()-14))
                    processedData2 = processData(analysisDate2)
                    break
                case "30 days":
                    analysisDate2.start = new Date(analysisDate2.start.setDate(analysisDate2.start.getDate()-30))
                    analysisDate2.end = new Date(analysisDate2.end.setDate(analysisDate2.end.getDate()-30))
                    processedData2 = processData(analysisDate2)
                    break

            }
            setCountryUsers({current: processedData.countryData, prev: processedData2.countryData})
            setRegionUsers({current: processedData.regionData, prev: processedData2.regionData})
            setHelpfulCount({current: processedData.helpful, prev: processedData2.helpful})
            setJobs({current: processedData.jobData, prev: processedData2.jobData})
            setAvgConvoLength({current: processedData.avgConvoLength, prev: processedData2.avgConvoLength})
            setCalData({current: processedData.calArray, prev: processedData2.calArray})
            setPromptTotal({current: processedData.promptTotal, prev: processedData2.promptTotal})
            setConvoTotal({current: processedData.convoTotal, prev: processedData2.convoTotal})
            setChosenAppsData({current: processedData.appData, prev: processedData2.appData})
            setCategoryData({current: processedData.categoryData, prev: processedData2.categoryData})
            setExcludeNoChosenApps(true)
            setAllExchanges({current: processedData.exchanges, prev: processedData2.exchanges})
            setAppsSum({current: processedData.promptAppSum, prev: processedData2.promptAppSum})
            // console.log(calArray)
        } else {
            const processedData = processData(analysisDate)
            setCountryUsers({current: processedData.countryData, prev: null})
            setRegionUsers({current: processedData.regionData, prev: null})
            setHelpfulCount({current: processedData.helpful, prev: null})
            setJobs({current: processedData.jobData, prev: null})
            setAvgConvoLength({current: processedData.avgConvoLength, prev: null})
            // console.log(calArray)
            setCalData({current: processedData.calArray, prev: null})
            setPromptTotal({current: processedData.promptTotal, prev: null})
            setChosenAppsData({current: processedData.appData, prev: null})
            setCategoryData({current: processedData.categoryData, prev: null})
            setExcludeNoChosenApps(true)
            setAllExchanges({current: processedData.exchanges, prev: null})
            setAppsSum({current: processedData.promptAppSum, prev: null})
        }
        // console.log("categoryCount",categoryCount)
        // console.log("categoryData",categoryData)
        // console.log(appsSum)
        
        
    },[data, useDate, analysisDate])

    useEffect(()=>{
        var width = 260
        var height = 260
        if (helpfulCount.current){
            PieChart(helpfulCount.current?.filter(entry => entry.value > 0 && !(entry.name === "No feedback" && excludeNoFeedback)),{
                name: d => d.name,
                value: d => d.value,
                width,
                height,
                innerRadius: width * 0.32
            }, piRef)
            // Get Fill values from d3
            var paths = d3.select(piRef.current).selectChild("g").selectChildren("path")
            const pathData = paths.nodes().map(path => ({
                fill: d3.select(path).attr('fill'),
                title: d3.select(path).select("title").text().split("\n")[0]
              }));
            // console.log("pathData",pathData)
            setHelpfulColors(pathData)
        }
    }, [helpfulCount, excludeNoFeedback])

    useEffect(()=>{
        var width = 400
        var height = 400
        if (categoryData.current){
            PieChart(categoryData.current?.filter(entry => entry.value > 0 && !(entry.name === "None" && excludeNoCategory)),{
                name: d => d.name,
                value: d => d.value,
                width: width,
                height: height,
                innerRadius: width * 0.32
            }, categoryRef)
            var paths = d3.select(categoryRef.current).selectChild("g").selectChildren("path")
            const pathData = paths.nodes().map(path => ({
                fill: d3.select(path).attr('fill'),
                title: d3.select(path).select("title").text().split("\n")[0]
              }));
            // console.log(pathData)
            setCategoryColors(pathData)
        }
        
    }, [categoryData, excludeNoCategory])
    useEffect(()=>{
        // console.log(calData)
        // console.log(calDifference)
        if (calData.current){
            if (calData.current[0] !== undefined && !useDate){
                switch(calDifference){
                    case true:
                        switch(calView){
                            case "totalExchanges":
                                Calendar(calData.current, {
                                    x: d => d.date,
                                    y: (d, i, data) => i > 0 ? (d.totalExchanges - data[i - 1].totalExchanges) / data[i - 1].totalExchanges : NaN,
                                    yFormat: "+%",
                                    weekday: "monday",
                                    width: 630
                                  }, calRef)
                                break
                            case "avgExchanges":
                                Calendar(calData.current, {
                                    x: d => d.date,
                                    y: (d, i, data) => i > 0 ? (d.avgExchanges - data[i - 1].avgExchanges) / data[i - 1].avgExchanges : NaN,
                                    yFormat: "+%",
                                    weekday: "monday",
                                    width: 630
                                    }, calRef)
                                break
                            case "totalConvos":
                                Calendar(calData.current, {
                                    x: d => d.date,
                                    y: (d, i, data) => i > 0 ? (d.totalConvos - data[i - 1].totalConvos) / data[i - 1].totalConvos : NaN,
                                    yFormat: "+%",
                                    weekday: "monday",
                                    width: 630
                                  }, calRef)
                                break
                        }  
                        break
                    case false:
                        switch(calView){
                            case "totalExchanges":
                                Calendar(calData.current, {
                                    x: d => d.date,
                                    y: d => d.totalExchanges,
                                    weekday: "monday",
                                    width: 630
                                  }, calRef)
                                break
                            case "avgExchanges":
                                Calendar(calData.current, {
                                    x: d => d.date,
                                    y: d => d.avgExchanges,
                                    weekday: "monday",
                                    width: 630
                                    }, calRef)
                                break
                            case "totalConvos":
                                Calendar(calData.current, {
                                    x: d => d.date,
                                    y: d => d.totalConvos,
                                    weekday: "monday",
                                    width: 630
                                  }, calRef)
                                break
                        }  
                        break
                }
            }
        }
        
        
    }, [calData, calView, calDifference])
    
    useEffect(()=>{
        if (countryUsers.current){
            switch(mapView){
                case "world":
                    Choropleth(countryUsers.current, {
                        id: d => d.name, // country name, e.g. Zimbabwe
                        value: d => d.users, // health-adjusted life expectancy
                        range: d3.interpolateYlGnBu,
                        features: countries,
                        featureId: d => d.properties.name, // i.e., not ISO 3166-1 numeric
                        borders: countrymesh,
                        projection: d3.geoEqualEarth(),
                        width: 640
                      },worldRef)
                    break
                case "US":
                    Choropleth(regionUsers.current, {
                        features: states,
                        borders: statemesh,
                        width : 975,
                        height:  610,
                        id: d => namemap.get(d.name),
                        value: d => d.users,
                        scale: d3.scaleQuantize,
                        domain: [1, 7],
                        range: d3.schemeBlues[6],
                    },worldRef)
                    break
            }
        }
        
        
    }, [countryUsers, mapView])
    useEffect(()=>{

        if (jobs.current?.length>0){
            var filteredJobs = [{
                name: "test",
                frequency: 1
            }]
            const sum = jobs.current?.map(job=>!(job.name === "None" && excludeNoJob) && job.frequency).reduce((prev, next) => prev + next)
            var filteredJobs = jobs.current?.filter(entry => !(entry.name === "None" && excludeNoJob)).map((job)=>{
                var temp = Object.assign({}, job);
                temp.raw = temp.frequency
                temp.frequency = temp.frequency/sum
                return temp;
            })
            
    
            BarChart(filteredJobs, {
                x: d => d.frequency,
                y: d => d.name,
                yDomain: d3.groupSort(filteredJobs, ([d]) => -d.frequency, d => d.name), // sort by descending frequency
                xFormat: "%",
                xLabel: "Frequency →",
                width: 720,
                color: "steelblue",
                marginLeft: 200,
                // marginRight: 20
              }, jobRef)
        }
        
    }, [jobs,excludeNoJob])
    useEffect(()=>{
        if (chosenAppsData.current){
            BarChart(chosenAppsData.current, {
                x: d => d.frequency,
                y: d => d.name,
                yDomain: d3.groupSort(chosenAppsData.current, ([d]) => -d.frequency, d => d.name), // sort by descending frequency
                xFormat: "%",
                xLabel: "Frequency →",
                width: 640,
                color: "steelblue",
                marginLeft: 100,
                marginRight: 20
              }, chosenAppsRef)
        }
        
    }, [chosenAppsData])

    useEffect(()=>{
        var appTotal = 0
        var appCount = {}
        var appData = []
        var usersIncluded = 0
        // console.log(chosenAppsFilter)
        var dataTemp = data
        if (useDate){
            if (analysisDate.end !== null){
                dataTemp = data.filter(user=>{
                    const d1 = new Date(user.createdAt)
                    return d1.getTime() > analysisDate.end.getTime() && d1.getTime() < (analysisDate.start.getTime() + 86400000); 
                })
            } else {
                data.filter(user=>{
                    const d1 = new Date(user.createdAt)
                    return d1.toDateString() === analysisDate.start.toDateString(); 
                })
            }
        }
        dataTemp.map(user=>{
            // var allApps = chosenAppsFilter.apps.length > 0 ? "":""
            // chosenAppsFilter.apps.every(r => chosenAppsData.includes(r))
            // chosenAppsFilter.apps.every(r => chosenAppsData.includes(r))
            var userIncluded = false
            if (chosenAppsFilter.apps.length > 0 && user.chosenApps.length>0 ){
                // console.log(user.chosenApps.length)
                if (chosenAppsFilter.apps.every(v => user.chosenApps.includes(v))){
                    // console.log("success",user)
                    user.chosenApps.filter((app)=>chosenAppsFilter.tags.length > 0 ? apps.find(o=>o.name===app).tags.every(v=>chosenAppsFilter.tags.includes(v)): true).forEach((app)=>{
                        if (appCount[app] === undefined){
                            appCount[app] = 0
                        }
                        appCount[app]++;
                        appTotal++;
                        if (!userIncluded){
                            usersIncluded++
                            userIncluded = true
                        }
                    }
                    )
                }
            } else {
                user.chosenApps.filter((app)=>chosenAppsFilter.tags.length > 0 ? apps.find(o=>o.name===app).tags.every(v=>chosenAppsFilter.tags.includes(v)): true).forEach((app)=>{
                    if (appCount[app] === undefined){
                        appCount[app] = 0
                    }
                    appCount[app]++;
                    appTotal++;
                    if (!userIncluded){
                        usersIncluded++
                        userIncluded = true
                    }
                    
                }
                )
            }
            
        })
        Object.keys(appCount).map((app)=>{
            appData.push({name: app, frequency: appCount[app]/ (excludeNoChosenApps === true ? usersIncluded : data.length)})
        })
        if (appData.length === 0 ){
            setExcludeNoChosenApps(false)
        }
        if (!excludeNoChosenApps && chosenAppsFilter.tags.length === 0){
            appData.push({name: "None", frequency: (data.length - usersIncluded)/data.length})
        }
        setChosenAppsData({current: appData, prev: null})
    }, [chosenAppsFilter, excludeNoChosenApps, analysisDate, useDate])

    function Items({ currentItems }) {
        return (
            <>
            {currentItems &&
              currentItems.map((item, i) => (
                <Tr key={i}>
                        {/* Category */}
                        <Td>{item.category}</Td> 
                        {/* Prompt */}
                        <Td>{item.prompt}</Td>
                        {/* Data Sources */}
                        <Td>{item.dataSources.length > 0 ?  item.dataSources[0] : "N/A"}</Td>
                        {/* Analyses */}
                        <Td>N/A</Td>
                        {/* Answer */}
                        <Td>N/A</Td>
                                
                </Tr>
              ))}
            </>
        );
      }

      function PaginatedItems({ items, itemsPerPage, Component }) {
        // Here we use item offsets; we could also use page offsets
        // following the API or data you're working with.
        const [itemOffset, setItemOffset] = useState(0);
        // console.log(items)
      
        // Simulate fetching items from another resources.
        // (This could be items from props; or items loaded in a local state
        // from an API endpoint with useEffect and useState)
        const endOffset = itemOffset + itemsPerPage;
        // console.log(`Loading items from ${itemOffset} to ${endOffset}`);
        const currentItems = items.slice(itemOffset, endOffset);
        const pageCount = Math.ceil(items.length / itemsPerPage);
      
        // Invoke when user click to request another page.
        const handlePageClick = (event) => {
          const newOffset = (event.selected * itemsPerPage) % items.length;
        //   console.log(
        //     `User requested page number ${event.selected}, which is offset ${newOffset}`
        //   );
          setItemOffset(newOffset);
        };
      
        return (
          <>
           <TableContainer overflowX={"auto"} borderRadius={"md"}>
                <Table borderRadius={"md"}>
                    <Thead background={"#134E48"} >
                        <Tr>
                            <Th color={"#FFFFFF"}>Category</Th>
                            <Th color={"#FFFFFF"}>Prompt Content</Th>
                            <Th color={"#FFFFFF"}>Data Sources</Th>
                            <Th color={"#FFFFFF"}>Analyses</Th>
                            <Th color={"#FFFFFF"}>Answer</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                    <Items currentItems={currentItems} />
                    </Tbody>
                </Table>
            </TableContainer>
            
            <ReactPaginate
                      nextLabel="next >"
                      onPageChange={handlePageClick}
                      pageRangeDisplayed={3}
                      marginPagesDisplayed={2}
                      pageCount={pageCount}
                      previousLabel="< previous"
                      pageClassName="page-item"
                      pageLinkClassName="page-link"
                      previousClassName="page-item"
                      previousLinkClassName="page-link"
                      nextClassName="page-item"
                      nextLinkClassName="page-link"
                      breakLabel="..."
                      breakClassName="page-item"
                      breakLinkClassName="page-link"
                      containerClassName="pagination"
                      activeClassName="active"
                      renderOnZeroPageCount={null}
              
            />
          </>
        );
      }


    function onDayChange(date) {
        setAnalysisDate(date);
      }

    function showTimeFrame(timeFrame){
        switch(timeFrame){
            case "7 days":
            case 1:
                return "Last 7 Days"
            case "14 days":
            case 2:
                return "Last 14 Days"
            case "30 days":
            case 3:
                return "Last 30 Days"
            case "All time":
            case 0:
                return "All"
            case "Custom":
                return "Custom Timeframe"
            default:
                return ""
        }
    }

    return (
        <Box width={"100vw"} height={"100vh"}>
        <Box height={"111px"} background={"linear-gradient(26.57deg, #125D56 8.33%, #107569 91.67%)"}>
            <Text display={{base: "none", md: "block"}} color={"#FFFFFF"} marginLeft={"30px"} paddingTop={"25px"} fontSize={"30px"} fontWeight={"600"}>Prifina Intelligence dashboard - Pri-AI Users</Text>
            <Text display={{base: "block", md: "none"}} color={"#FFFFFF"} marginLeft={"30px"} paddingTop={"25px"} fontSize={"30px"} fontWeight={"600"}>Pri-AI Dashboard</Text>
        </Box>
        <Box margin={"20px"}> 
            <Flex width={"100%"} flexDirection={{base :"column", lg: "row"}}>
            <Box width={"100%"} overflowX={"auto"}>
            <ButtonGroup isDisabled={data.length===0} isAttached variant={"outline"}>
            <Button isActive={dateButton === "7 days"} onClick={() => {
                var d = new Date();
                d.setHours(24,0,0,0);
                const date = new Date(d); 
                var date2 = new Date(d); 
                date2.setDate(date2.getDate() - 7); 
                setDateButton("7 days"); 
                setAnalysisDate({start: new Date(date), end: new Date(date2)}); 
                setUseDate(true)
                }} >Last 7 days</Button>
            <Button isActive={dateButton === "14 days"} onClick={() => {
                var d = new Date();
                d.setHours(24,0,0,0);
                const date = new Date(d); 
                var date2 = new Date(d); 
                date2.setDate(date2.getDate() - 14); 
                setDateButton("14 days"); 
                setAnalysisDate({start: date, end: date2}); 
                setUseDate(true)
                }} >Last 14 days</Button>
            <Button isActive={dateButton === "30 days"} onClick={() => {
                var d = new Date();
                d.setHours(24,0,0,0);
                const date = new Date(d); 
                var date2 = new Date(d); 
                date2.setDate(date2.getDate() - 30); 
                setDateButton("30 days"); 
                setAnalysisDate({start: date, end: date2}); 
                setUseDate(true)
                }} >Last 30 days</Button>
            <Button isActive={dateButton === "All time"} onClick={() => {setDateButton("All time");setUseDate(false)} } >All time</Button>
            <Popover
            >
                <PopoverTrigger>
                <Button isActive={dateButton === "Custom"} onClick={() => setDateButton("Custom")} >Custom Date</Button>
                </PopoverTrigger>
                <Portal>
                    <PopoverContent>
                        <PopoverArrow/>
                        <PopoverCloseButton />
                        <PopoverBody>
                            <Button onClick={()=>{setAnalysisDate({start: new Date(), end: null})}}>Reset</Button>
                            {/* <Button onClick={()=>{setUseRange(!useRange)}}>{useRange ? "Use Single" : "Use Range"}</Button> */}
                            <DatePicker popperModifiers={[
        {
          name: 'arrow',
          options: { padding: 24 },
        },
      ]} placeholderText="Leave Clear for One Date" todayButton="Today" selected={analysisDate.end} onChange={(date) => {setAnalysisDate({...analysisDate, end: date});setUseDate(true)}}/>
       <DatePicker popperModifiers={[
        {
          name: 'arrow',
          options: { padding: 24 },
        },
      ]} todayButton="Today" selected={analysisDate.start} onChange={(date) => {setAnalysisDate({...analysisDate, start: date});setUseDate(true)}}/>
                    </PopoverBody>
                    </PopoverContent>
                </Portal>
            </Popover>
            
            
            </ButtonGroup>
            </Box>
            <Spacer/>
                <Flex flexDirection={"column"}>
                <Button isLoading={fetchingData} isDisabled={fetchingData} onClick={getData}> {data.length > 0 ? "Refresh data" : "You Need To Fetch Data"}</Button>
                <Text>Last Refresh Time: {refreshDate === null ? `${refreshDate}` : `${refreshDate.toLocaleDateString()} ${refreshDate.toLocaleTimeString()}`}</Text>
            
                </Flex>
               
            
            
            
            </Flex>
            {/* <Button isDisabled={data.length===0} onClick={()=>{setUseDate(!useDate)}}>{useDate ? "Overview" : "Use Date"}</Button>
            <DatePicker popperModifiers={[
        {
          name: 'arrow',
          options: { padding: 24 },
        },
      ]} todayButton="Today" selected={analysisDate} onChange={(date) => setAnalysisDate(date)} disabled={!useDate}/> */}
        <Flex flexDirection={"column"} gap={"10px"}>
            <Box border={"1px solid #D0D5DD"} borderRadius={"8px"} padding={"8px 16px 16px"}>
                <Text fontWeight={"600"}>Key chat metrics <span style={{color: "#667085"}}>({showTimeFrame(dateButton)})</span></Text>
                <Box height={"1px"} width={"100%"} background={"#EAECF0"} marginTop={"16px"} marginBottom={"16px"}></Box>
                <Flex flexDirection={{base: "column", sm: "row"}} gap={"10px"}>
                <Flex flexDirection={"column"} flex={1} padding={"24px"} border={"1px solid #EAECF0"} borderRadius={"12px"} boxShadow={"0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06);"}>
                    <Text color={"#475467"} fontWeight={"500"}>Total chat sessions</Text>
                    {
                useDate ? (
                    <>
                    {
                        analysisDate.end !== null ? (
                            <Flex>
                            <Text fontWeight={"600"} fontSize={"36px"} marginTop={"auto"}>{convoTotal.current}</Text>
                            <CompareBadge current={convoTotal.current} prev={convoTotal.prev} />
                            </Flex>
                        ) : (
                            <>
                            <Text fontWeight={"600"} fontSize={"36px"} marginTop={"auto"}>{data.filter(user=>{
                                const d1 = new Date(user.createdAt)
                                return d1.toDateString() === analysisDate.start.toDateString(); 
                            }).length}</Text>
                            </>
                        )
                    }
                    </>
                ) : (
                    <>
                        <Text fontWeight={"600"} fontSize={"36px"} marginTop={"auto"}>{data.length}</Text>
                    </>
                )
            }
                </Flex>
                <Flex flexDirection={"column"} flex={1} padding={"24px"} border={"1px solid #EAECF0"} borderRadius={"12px"} boxShadow={"0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06);"}>
                    <Text color={"#475467"} fontWeight={"500"}>Total prompts</Text>
                    <Flex>
                    <Text fontWeight={"600"} fontSize={"36px"} marginTop={"auto"}>{promptTotal.current}</Text>
                    <CompareBadge current={promptTotal.current} prev={promptTotal.prev} />
                    </Flex>
                </Flex >
                <Flex flexDirection={"column"} flex={1} padding={"24px"} border={"1px solid #EAECF0"} borderRadius={"12px"} boxShadow={"0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06);"}>
                    <Text color={"#475467"} fontWeight={"500"}>Average conversation length</Text>
                    <Flex>
                    <Text fontWeight={"600"} fontSize={"36px"} marginTop={"auto"}>{avgConvoLength.current?.toFixed(1)}</Text>
                    <CompareBadge current={avgConvoLength.current} prev={avgConvoLength.prev} />
                    </Flex>


                </Flex>
                </Flex>
            </Box>
            <Box border={"1px solid #D0D5DD"} borderRadius={"8px"} padding={"24px"}>
            <Flex flexDirection={{base:"column", md:"row"}} gap={"5px"}>
            <Flex flexDirection={"column"} width={"100%"}>
            <Flex flexDirection={{base:"column", md:"row"}} height={"27px"}>
                <Text fontSize={"18px"} fontWeight={"600"}>In-app user feedback <span style={{color: "#667085"}}>({showTimeFrame(dateButton)})</span></Text>
                <Button variant={"ghost"} display={"inline-flex"} size={"sm"} marginLeft={{base: "0px", md: "auto"}} marginRight={"5px"} width={"fit-content"} onClick={()=>{setExcludeNoFeedback(!excludeNoFeedback)}}>{excludeNoFeedback ? `Include "No Feedback"` : `Exclude "No Feedback"`}</Button>
            </Flex>
            <Flex flexDirection={{base:"column", md:"row"}} width={"100%"}>
            <Flex  maxW={{base: "unset", md: "50%", lg: "35%"}} width={{base:"100%", md:"50%"}}  flexDirection={"column"}>
                

                <Box height={"1px"} width={"100%"} background={"#EAECF0"} marginTop={"16px"} marginBottom={"16px"}></Box>
                <Flex justifyContent={"center"} alignItems={"start"}>
                    <Box minW={"260px"}>
                     <svg ref={piRef}/>

                    </Box>
                <Flex flexDirection={"column"}>
                {
                    helpfulCount.current?.filter(entry => entry.value > 0 && !(entry.name === "No feedback" && excludeNoFeedback)).sort(function(a, b){return b.name-a.name}).map(helpful=>{
                        return (
                            <Box key={helpful.name} display={"flex"} flexDirection={"row"} alignItems={"center"}>
                                <div style={{marginRight: "3px", width: "10px", height: "10px", borderRadius: "10px", background: helpfulColors?.find(val=>val.title===helpful.name)?.fill, display:"inline-block"}}></div>
                                
                            {/* {helpful.name} - {helpful.value} ({((helpful.value/(excludeNoFeedback ? promptTotal - helpfulCount.find(entry=>entry.name=== "No feedback").value : promptTotal))*100).toFixed(3)}%) */}
                            <Text color={"#475467"}>{helpful.name}</Text>
                            </Box>
                        )
                        })
                }
            

                </Flex>
                </Flex>

           
            </Flex>
            <Flex flexDirection={"column"} flexGrow={1}>
                <Box height={"1px"} width={"100%"} background={"#EAECF0"} marginTop={"16px"} marginBottom={"16px"}></Box>
                <Box padding={"10px"}>
                <Flex flexDirection={{base:"column", lg:"row"}} gap={{base:"5px", lg:"25px"}}>
                    <Flex onMouseEnter={()=>{
                        d3.select(piRef.current).selectAll(".arcs").transition().attr("opacity", 0.3)
                        d3.select(piRef.current).selectAll(".arcs-0").transition().attr("opacity", 1)
                    }} onMouseLeave={()=>{
                        d3.select(piRef.current).selectAll(".arcs").transition().attr("opacity", 1)
                    }} flexDirection={"column"} padding={"24px"} width={{base:"100%", lg:"50%"}} height={"120px"} background={"#125D56"} border={"1px solid #EAECF0"} boxShadow={"0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)"} borderRadius={"12px"}>
                    <Text color={"#FFFFFF"} fontWeight={"500"}>Helpful Feedback</Text>
                    <Flex>
                    <Text color={"#FFFFFF"} fontWeight={"600"} fontSize={"36px"} marginTop={"auto"}>{helpfulCount.current?.find(helpful=>helpful.name === "Helpful")?.value || "N/A"}</Text>
                    <CompareBadge current={helpfulCount.current ? helpfulCount.current.find(helpful=>helpful.name === "Helpful")?.value || 0 : null} prev={helpfulCount.prev ? helpfulCount.prev.find(helpful=>helpful.name === "Helpful")?.value || 0 : null} />
                    </Flex>
                    </Flex>
                    <Flex onMouseEnter={()=>{
                        d3.select(piRef.current).selectAll(".arcs").transition().attr("opacity", 0.3)
                        d3.select(piRef.current).selectAll(".arcs-1").transition().attr("opacity", 1)
                    }} onMouseLeave={()=>{
                        d3.select(piRef.current).selectAll(".arcs").transition().attr("opacity", 1)
                    }} flexDirection={"column"} padding={"24px"} width={{base:"100%", lg:"50%"}} height={"120px"} background={"#F04438"} border={"1px solid #EAECF0"} boxShadow={"0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)"} borderRadius={"12px"}>
                    <Text color={"#FFFFFF"} fontWeight={"500"}>Unhelpful Feedback</Text>
                    <Flex>
                    <Text color={"#FFFFFF"} fontWeight={"600"} fontSize={"36px"} marginTop={"auto"}>{helpfulCount.current?.find(helpful=>helpful.name === "Unhelpful")?.value || "N/A"}</Text>
                    <CompareBadge current={helpfulCount.current ? helpfulCount.current.find(helpful=>helpful.name === "Unhelpful")?.value || 0 : null} prev={helpfulCount.prev ? helpfulCount.prev.find(helpful=>helpful.name === "Unhelpful")?.value || 0 : null}/>
                    </Flex>
                    </Flex>
                </Flex>
                <Flex onMouseEnter={()=>{
                        d3.select(piRef.current).selectAll(".arcs").transition().attr("opacity", 0.3)
                        d3.select(piRef.current).selectAll(".arcs-2").transition().attr("opacity", 1)
                    }} onMouseLeave={()=>{
                        d3.select(piRef.current).selectAll(".arcs").transition().attr("opacity", 1)
                    }} flexDirection={"column"} padding={"24px"} marginTop={"5px"} width={"100%"} height={"120px"} background={"#FFFFFF"} border={"1px solid #EAECF0"} boxShadow={"0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)"} borderRadius={"12px"}>
                    <Text color={"#475467"} fontWeight={"500"}>No Feedback</Text>
                    <Flex>
                    <Text fontWeight={"600"} fontSize={"36px"} marginTop={"auto"}>{helpfulCount.current?.find(helpful=>helpful.name === "No feedback")?.value || "N/A"}</Text>
                    <CompareBadge current={helpfulCount.current ? helpfulCount.current.find(helpful=>helpful.name === "No feedback")?.value || 0 : null} prev={helpfulCount.prev ? helpfulCount.prev.find(helpful=>helpful.name === "No feedback")?.value || 0 : null}/>
                    </Flex>
                </Flex>
                </Box>
            </Flex>
            </Flex>

            </Flex>
            </Flex>

            
            
           
            
            </Box>
        
            <Box border={"1px solid #D0D5DD"} borderRadius={"8px"} padding={"24px 16px"} width={"100%"}>
                <Text padding={"10px"} fontWeight={"600"} fontSize={"18px"} color={"#101828"}>Top data sources mentioned in user queries <span style={{color: "#667085"}}>({showTimeFrame(dateButton)})</span></Text>
            <Box height={"1px"} width={"100%"} background={"#EAECF0"} marginTop={"16px"} marginBottom={"16px"}></Box>
            <SimpleGrid minChildWidth={{base: "200px", lg: '350px'}} spacing='40px' padding={"20px"}>
                {console.log(appsSum)}
                {
                    appsSum.current?.sort((a,b)=>b.value-a.value).map((app,i)=>(
                        <Flex flexDir={"column"} key={i} maxWidth={"400px"}   height={"100%"} padding={"24px"} border={"1px solid #EAECF0"} borderRadius={"12px"} boxShadow={"0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06);"}>
                            <Box background={"#F2F4F7"} border={"8px solid #F9FAFB"} borderRadius={"28px"} width={"60px"} height={"60px"} justifyContent={"center"} display={"flex"} padding={"6px"}>
                                <img src={getAppLogo(app.name).src} alt={`${app.name} Logo`} />
                            </Box>

                            <Text fontWeight={"400"} color={"#475467"}>User queries mentioning {app.name}</Text>
                            <Flex>
                            <Text fontSize={"24px"} fontWeight={"600"} marginTop={"auto"}>{app.value}</Text>
                            <CompareBadge current={app.value} prev={useDate ? appsSum.prev ? appsSum.prev?.find(prevApp => prevApp.name === app.name)?.value || 0 :  0 : null} />
                            </Flex>
                            
                            
                        </Flex>
                    ))
                }
            </SimpleGrid>
            </Box>
            
            <Box border={"1px solid #D0D5DD"} borderRadius={"8px"} padding={"24px 16px"} width={"100%"}>
                <Flex>
                    <Text as="b" fontSize={"2xl"}>Conversation Analysis</Text>
                    <Spacer/>
                    <Button variant={"ghost"} onClick={()=>{setExcludeNoCategory(!excludeNoCategory)}}>{excludeNoCategory ? "Include No Category" : "Exclude No Category"}</Button>
                </Flex>
            <Flex flexDirection={"column"} gap={"10px"}>
            <Flex flexDirection={{base: "column", md: "row"}} gap={"10px"}>
            <Box border={"1px solid #D0D5DD"} borderRadius={"8px"} padding={"24px 16px"} width={"100%"}>

            <Text fontSize={"18px"} fontWeight={"600"}>Prompt Categories <span style={{color: "#667085"}}>({showTimeFrame(dateButton)})</span></Text>
                


            {/* Total Prompts: {(excludeNoCategory ? promptTotal - (categoryData.find(entry=>entry.name=== "None") || {value:0}).value : promptTotal)} */}
            <Box height={"1px"} width={"100%"} background={"#EAECF0"} marginTop={"16px"} marginBottom={"16px"}></Box>
            <Flex flexDir={"column"} gap={"10px"}>

            
            <Select width={"unset"} flexGrow={"1"}  placeholder='Sort Categories' defaultValue={"value desc"} onChange={(e)=>{setCategorySort(e.target.value)}}>
                    <option value='value desc'>Value - DESC</option>
                    <option value='value asc'>Value - ASC</option>
                    <option value='name desc'>Name - Z-{">"}A</option>
                    <option value='name asc'>Name - A-{">"}Z</option>
                </Select>
            <SimpleGrid maxH={"500px"} overflowY={"auto"} minChildWidth='120px' spacing='40px' padding={"20px"}>
            {
                categoryData.current?.filter(entry => entry.value > 0 && !(entry.name === "None" && excludeNoCategory)).sort(function(a, b){
                    switch(categorySort){
                        case "value desc":
                            return b.value-a.value
                        case "value asc":
                            return a.value-b.value
                        case "name asc":
                            if (a.name < b.name) {
                                return -1;
                              }
                              if (a.name > b.name) {
                                return 1;
                              }
                              return 0;
                        case "name desc":
                            if (a.name < b.name) {
                                return 1;
                              }
                              if (a.name > b.name) {
                                return -1;
                              }
                              return 0;
                        default:
                            return null
                    }
                }).map((category,i)=>{
                    return (
                        <Flex key={category.name} onMouseEnter={()=>{
                            d3.select(categoryRef.current).selectAll(".arcs").transition().attr("opacity", 0.3)
                            d3.select(categoryRef.current).selectAll(`.arcs-${categoryData.current?.filter(entry => entry.value > 0 && !(entry.name === "None" && excludeNoCategory)).findIndex(findCategory=>findCategory.name===category.name)}`).transition().attr("opacity", 1)
                        }} onMouseLeave={()=>{
                            d3.select(categoryRef.current).selectAll(".arcs").transition().attr("opacity", 1)
                        }}>
                            <div style={{marginTop: "7px", marginRight: "7px", minWidth: "10px", height: "10px", borderRadius: "10px", background: categoryColors?.find(val=>val.title===category.name)?.fill, display:"inline-block"}}></div>
                            <Box height={"100%"} display={"flex"} flexDirection={"column"}> 
                            <Text color={"#475467"}>
                                {category.name} </Text>
                            <Text fontSize={"24px"} fontWeight={"600"} marginTop={"auto"}>
                                {category.value}
                            </Text>
                            <Text fontSize={"10px"} fontWeight={"600"}>
                                {((category.value/(excludeNoCategory ? promptTotal.current - (categoryData.current?.find(entry=>entry.name=== "None") || {value:0}).value : promptTotal.current))*100).toFixed(3)}%
                            </Text>
                            </Box>
                        
                        </Flex>
                    )
                })
            }
            </SimpleGrid>
            </Flex>
            </Box>
            <Box border={"1px solid #D0D5DD"} borderRadius={"8px"} padding={"24px 16px"}>
            <Text fontSize={"18px"} fontWeight={"600"}>Prompt Categories <span style={{color: "#667085"}}>({showTimeFrame(dateButton)})</span></Text>
            <Box height={"1px"} width={"100%"} background={"#EAECF0"} marginTop={"16px"} marginBottom={"16px"}></Box>
            <svg ref={categoryRef}/>
            </Box>
            </Flex>
            <Box border={"1px solid #D0D5DD"} borderRadius={"8px"} padding={"24px"}>
            <Text fontSize={"2xl"} fontWeight={"600"}>Explore prompts <span style={{color: "#667085"}}>({showTimeFrame(promptRange)})</span></Text>
            <Text>Filter prompts by category, date or search.</Text>
            <Box height={"1px"} width={"100%"} background={"#EAECF0"} marginTop={"16px"} marginBottom={"16px"}></Box>
            <Box marginBottom={"16px"}>
                <Box width={"100%"} overflowX={"auto"}>
                <ButtonGroup variant={"outline"} isAttached>
                    <Button isActive={promptRange === 0} onClick={()=>{setPromptRange(0)}}>View All</Button>
                    <Button isActive={promptRange === 1} onClick={()=>{
                        var d = new Date();
                        d.setHours(24,0,0,0);
                        const date = new Date(d); 
                        var date2 = new Date(d); 
                        date2.setDate(date2.getDate() - 7); 
                        setPromptRange(1); 
                        setPromptAnalysisRange({start: date.getTime(), end: date2.getTime()}); 
                        }}>Last 7 Days</Button>
                    <Button isActive={promptRange === 2} onClick={()=>{var d = new Date();
                        d.setHours(24,0,0,0);
                        const date = new Date(d); 
                        var date2 = new Date(d); 
                        date2.setDate(date2.getDate() - 14); 
                        setPromptRange(2); 
                        setPromptAnalysisRange({start: date.getTime(), end: date2.getTime()}); }}>Last 14 Days</Button>
                    <Button isActive={promptRange === 3} onClick={()=>{var d = new Date();
                        d.setHours(24,0,0,0);
                        const date = new Date(d); 
                        var date2 = new Date(d); 
                        date2.setDate(date2.getDate() - 30); 
                        setPromptRange(3); 
                        setPromptAnalysisRange({start: date.getTime(), end: date2.getTime()}); }}>Last 30 days</Button>
                </ButtonGroup>
                </Box>
                <Input placeholder="Search" value={promptSearch} onChange={(e)=>{setPromptSearch(e.target.value)}}/>
                <Button onClick={()=>{setShowFilter(!showFilter)}}>Filters</Button>
                {showFilter && (
                    <>
                    <MultiSelect
                        isMulti
                        name="apps"
                        colorScheme="purple"
                        options={[
                            {
                                label: "Feedback",
                                options: [{
                                    label: "Helpful",
                                    value: true
                                },{
                                    label: "Unhelpful",
                                    value: false
                                },{
                                    label: "No Feedback",
                                    value: undefined
                                },]
                            }
                        ]}
                        placeholder="Show exchanges with the feedback"
                        onChange={(e)=>{setPromptFeedbackView({...promptFeedbackView, feedback: e.map(o=>o.value)})}}
                        closeMenuOnSelect={false}
                    />
                    <MultiSelect
                        isMulti
                        name="apps"
                        colorScheme="purple"
                        options={[
                            {
                                label: "Categories",
                                options: categoryData.current?.map(item => ({label: item.name, value: item.name}))
                            }
                        ]}
                        placeholder="Show exchanges with the category"
                        onChange={(e)=>{setPromptFeedbackView({...promptFeedbackView, category: e.map(o=>o.value)})}}
                        closeMenuOnSelect={false}
                    />
                    <MultiSelect
                        isMulti
                        name="apps"
                        colorScheme="purple"
                        options={[
                            {
                                label: "Jobs",
                                options: jobs.current?.map(item => ({label: item.name, value: item.name}))
                            }
                        ]}
                        placeholder="Show exchanges from users with this job"
                        onChange={(e)=>{setPromptFeedbackView({...promptFeedbackView, job: e.map(o=>o.value)})}}
                        closeMenuOnSelect={false}
                    />
                    <MultiSelect
                        isMulti
                        name="apps"
                        colorScheme="purple"
                        options={[
                            {
                                label: "Apps",
                                options: filterAppsOptions
                            }
                        ]}
                        placeholder="Show exchanges from users using these apps"
                        onChange={(e)=>{setPromptFeedbackView({...promptFeedbackView, apps:e.map(o=>o.value)})}}
                        closeMenuOnSelect={false}
                    />
                    <Flex>
                    <MultiSelect
                        isMulti
                        name="apps"
                        colorScheme="purple"
                        options={[
                            {
                                label: "Apps",
                                options: filterAppsOptions
                            }
                        ]}
                        placeholder="Show exchanges that make use of these apps"
                        onChange={(e)=>{setPromptFeedbackView({...promptFeedbackView, dataSources:e.map(o=>o.value)})}}
                        closeMenuOnSelect={false}
                        chakraStyles={{
                            container: (base) => ({
                                ...base,
                                flexGrow: 1
                              }),
                        }}
                    />
                    <Button isActive={promptDataSourceViewUnion} onClick={()=>{setPromptDataSourceViewUnion(!promptDataSourceViewUnion)}}>Union</Button>
                    </Flex>
                    </>
                )}
            </Box>
                        {/* {console.log(data)} */}
            <PaginatedItems items={data.map(user=>{
                return user.exchanges.map(exchange=>{
                    var dataSources = []
                    apps.map(val=>val.name).forEach((value)=>{
                        if (exchange.prompt.toLowerCase().search(value.toLowerCase())>-1){
                            dataSources.push(value)
                        }
                    })
                    return {
                        ...exchange,
                        country : user.country,
                        region : user.region,
                        job : user.job ? user.job.trim().toLowerCase() : "None",
                        chosenApps : user.chosenApps ? user.chosenApps : [],
                        dataSources: dataSources
                    }
                })
            }).flat().filter(exchange=>((promptFeedbackView.dataSources.length === 0 ? true : exchange.dataSources.length > 0 ? promptDataSourceViewUnion === true ? promptFeedbackView.dataSources.every(v => exchange.dataSources.includes(v)) : promptFeedbackView.dataSources.some(v => exchange.dataSources.includes(v))  : false)&&(promptFeedbackView.feedback.length === 0 ? true : promptFeedbackView.feedback.includes(exchange.helpful))&&(promptFeedbackView.category.length === 0 ? true : promptFeedbackView.category.includes(exchange.category))&&(promptFeedbackView.job.length === 0 ? true : promptFeedbackView.job.includes(exchange.job))&&(promptFeedbackView.apps.length === 0 ? true : promptFeedbackView.apps.some(r=> exchange.chosenApps.includes(r)))&&(promptSearch === "" ? true : exchange.prompt.toLowerCase().indexOf(promptSearch.toLowerCase()) !== -1)&&(promptRange === 0 ? true : exchange.createdAt > promptAnalysisRange.end && exchange.createdAt < (promptAnalysisRange.start))))}  itemsPerPage={10}/>
            </Box>
            </Flex>
            </Box>
            {
                 !useDate && (
                 <>
                 <Box border={"1px solid #D0D5DD"} borderRadius={"8px"} padding={"24px"}>
                 <Text fontSize={"2xl"} fontWeight={"600"}>Conversations <span style={{color: "#667085"}}>({showTimeFrame(dateButton)})</span></Text>
                <Text>Calendar view of conversations and exchange</Text>
                <Box height={"1px"} width={"100%"} background={"#EAECF0"} marginTop={"16px"} marginBottom={"16px"}></Box>
                 <Select placeholder='Select option' defaultValue={"totalConvos"} onChange={(e)=>{setCalView(e.target.value)}}>
                    <option value='totalConvos'>Total Conversations</option>
                    <option value='totalExchanges'>Total Exchanges</option>
                    <option value='avgExchanges'>Average Exchanges</option>
                </Select>
                  <Button onClick={()=>{setCalDifference(!calDifference)}}>{calDifference ? "Show Total" : "Show Difference"}</Button>
                <svg ref={calRef}/>
                </Box>
                 </>)
            }
            <Box border={"1px solid #D0D5DD"} borderRadius={"8px"} padding={"24px 16px"} width={"100%"}>
            <Text as="b" fontSize={"2xl"}>User Profiles</Text>
            <Flex flexDir={"column"} gap={"10px"}>
            <Box border={"1px solid #D0D5DD"} borderRadius={"8px"} padding={"24px 16px"} width={"100%"}>
            <Flex flexDirection={"column"}>
                    <Text fontSize={"2xl"} fontWeight={"600"}>Location <span style={{color: "#667085"}}>({showTimeFrame(dateButton)})</span></Text>
                    <Text>World Map of Provided Locations</Text>
                    </Flex>
            <Box height={"1px"} width={"100%"} background={"#EAECF0"} marginTop={"16px"} marginBottom={"16px"}></Box>
            <Select placeholder='Select option' defaultValue={"world"} onChange={(e)=>{setMapView(e.target.value)}}>
                <option value='world'>World</option>
                <option value='US'>US</option>
            </Select>
            <svg ref={worldRef}/>
            </Box>
            <Flex flexDir={{base: "column", md: "row"}} gap={"10px"}>
            <Box border={"1px solid #D0D5DD"} borderRadius={"8px"} padding={"24px 16px"} width={{base: "100%", md: "50%"}}>
                <Flex flexDirection={"row"}>
                    <Flex flexDirection={"column"}>
                    <Text fontSize={"2xl"} fontWeight={"600"}>Jobs <span style={{color: "#667085"}}>({showTimeFrame(dateButton)})</span></Text>
                    <Text>Distribution of Jobs</Text>
                    </Flex>
                
                    <Spacer/>
                    <Button alignSelf={"center"} variant={"ghost"} onClick={()=>{setExcludeNoJob(!excludeNoJob)}}>{excludeNoJob ? "Include No Jobs" : "Exclude No Jobs"}</Button>
                </Flex>
            <Box height={"1px"} width={"100%"} background={"#EAECF0"} marginTop={"16px"} marginBottom={"16px"}></Box>
            <svg ref={jobRef}/>
            </Box>
            <Box border={"1px solid #D0D5DD"} borderRadius={"8px"} padding={"24px"} width={{base: "100%", md: "50%"}}>
            <Flex flexDirection={"row"}>
                    <Flex flexDirection={"column"}>
                    <Text fontSize={"2xl"} fontWeight={"600"}>Chosen Apps <span style={{color: "#667085"}}>({showTimeFrame(dateButton)})</span></Text>
                    <Text>Distribution of chosen data sources.</Text>
                    </Flex>
                
                    <Spacer/>
            
                    <Button alignSelf={"center"} variant={"ghost"} isDisabled={chosenAppsData.current?.length===1&&chosenAppsData.current[0].name==="None"} onClick={()=>{setExcludeNoChosenApps(!excludeNoChosenApps)}}>{excludeNoChosenApps ? "Include No Chosen Apps" : "Exclude No Chosen Apps"}</Button>
                </Flex>
                <Box height={"1px"} width={"100%"} background={"#EAECF0"} marginTop={"16px"} marginBottom={"16px"}></Box>
            <MultiSelect
                isMulti
                name="tags"
                colorScheme="purple"
                options={[
                    {
                        label: "Tags",
                        options: [{
                            label: "Transport",
                            value: "Transport"
                        },{
                            label: "Health & Fitness",
                            value: "Health"
                        },{
                            label: "Social & Streaming",
                            value: "Social"
                        },{
                            label: "Misc",
                            value: "Misc"
                        },]
                    }
                ]}
                placeholder="Show only apps with these tags"
                onChange={(e)=>{setChosenAppsFilter({...chosenAppsFilter, tags:e.map(o=>o.value)})}}
                closeMenuOnSelect={false}
            />
            <MultiSelect
                isMulti
                name="apps"
                colorScheme="purple"
                options={[
                    {
                        label: "Apps",
                        options: filterAppsOptions
                    }
                ]}
                placeholder="Show apps from users using these apps"
                onChange={(e)=>{setChosenAppsFilter({...chosenAppsFilter, apps:e.map(o=>o.value)})}}
                closeMenuOnSelect={false}
            />
            <Text>E.g. selecting "Transport" with "Facebook" will show the Transport apps that the Facebook users selected</Text>
            <svg ref={chosenAppsRef}/>
            </Box>
            </Flex>
            </Flex>
            </Box>
            </Flex>
        </Box>        

        </Box>
    )
}


  

export default App