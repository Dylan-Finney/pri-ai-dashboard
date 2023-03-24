/* eslint-disable react/no-unescaped-entities */
import { Box, Button, Select, Text } from "@chakra-ui/react";
import axios from "axios"
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import PieChart from "./PieChart";
import world from "./countries-50m.json"
import us from "./counties-albers-10m.json"
import * as topojson from "topojson-client";
import Choropleth from "./Choropleth";
import BarChart from "./BarChart";
import Calendar from "./Calendar";
import { Select as MultiSelect } from "chakra-react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


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

    const [excludeNoFeedback, setExcludeNoFeedback] = useState(false)
    const [refreshDate, setRefreshDate] = useState(null)
    const [excludeNoCategory, setExcludeNoCategory] = useState(false)
    const [data, setData] = useState([])
    const [promptTotal, setPromptTotal] = useState(0)
    const [fetchingData, setFetchingData] = useState(false)
    const [calData, setCalData] = useState([])
    const [avgConvoLength, setAvgConvoLength] = useState(0)
    const [countryUsers, setCountryUsers] = useState([])
    const [regionUsers, setRegionUsers] = useState([])
    const [categoryData, setCategoryData] = useState([])
    const [helpfulCount, setHelpfulCount] = useState([])
    const [jobs, setJobs] = useState([])
    const [chosenAppsData, setChosenAppsData] = useState([])
    const [mapView, setMapView] = useState("world")
    const [calView, setCalView] = useState("totalConvos")
    const [calDifference, setCalDifference] = useState(false)
    const [excludeNoChosenApps, setExcludeNoChosenApps] = useState(true)
    const [analysisDate, setAnalysisDate] = useState(new Date())
    const [useDate, setUseDate] = useState(false)
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
    useEffect(()=>{
        var helpful = [{name: "Helpful", value: 0},{name: "Unhelpful", value: 0},{name: "No feedback", value: 0}]
        var jobTotal = 0
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
        var convoLength = 0
        var dataTemp = data
        if (useDate){
            dataTemp = data.filter(user=>{
                const d1 = new Date(user.createdAt)
                return d1.getFullYear() === analysisDate.getFullYear() &&
                d1.getMonth() === analysisDate.getMonth() &&
                d1.getDate() === analysisDate.getDate(); 
            })
        }
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
                switch(exchange.helpful){
                    case true:
                        helpful[0].value++;
                        break
                    case false:
                        helpful[1].value++;
                        break
                    default:
                        helpful[2].value++;
                        break
                }
                if (exchange.category === null){
                    if (categoryCount["None"] === undefined){
                        categoryCount["None"] = 0
                    }
                    categoryCount["None"]++
                } else {
                    if (categoryCount[exchange.category] === undefined){
                        categoryCount[exchange.category] = 0
                    }
                    categoryCount[exchange.category]++
                }

                
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
            //Country Count
            if (user.details!==null){
                if (countryCount[user.details.country] === undefined){
                    countryCount[user.details.country] = 0
                    regionCount[user.details.country] = {}
                    regionCount[user.details.country][user.details.region] = 0
                } else if (regionCount[user.details.country][user.details.region] === undefined) {
                    regionCount[user.details.country][user.details.region] = 0
                }
                const job = user.details.job.trim().toLowerCase()
                if (jobCount[job] === undefined){
                    jobCount[job] = 0
                }
                countryCount[user.details.country]++;
                regionCount[user.details.country][user.details.region]++;
                jobCount[job]++;
                jobTotal++
            }
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
            jobData.push({name: job, frequency: jobCount[job]/jobTotal})
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
        // console.log("categoryCount",categoryCount)
        // console.log("categoryData",categoryData)

        calArray.push(calData[calData.length - 1]);
        setCountryUsers(countryData)
        setRegionUsers(regionData)
        setHelpfulCount(helpful)
        setJobs(jobData)
        setAvgConvoLength(convoLength/data.length)
        // console.log(calArray)
        setCalData(calArray)
        setPromptTotal(promptTotal)
        setChosenAppsData(appData)
        setCategoryData(categoryData)
        setExcludeNoChosenApps(true)
    },[data, useDate, analysisDate])

    useEffect(()=>{
        PieChart(helpfulCount.filter(entry => entry.value > 0 && !(entry.name === "No feedback" && excludeNoFeedback)),{
            name: d => d.name,
            value: d => d.value,
            width: 640,
            height: 500
        }, piRef)
    }, [helpfulCount, excludeNoFeedback])

    useEffect(()=>{
        PieChart(categoryData.filter(entry => entry.value > 0 && !(entry.name === "None" && excludeNoCategory)),{
            name: d => d.name,
            value: d => d.value,
            width: 640,
            height: 500
        }, categoryRef)
    }, [categoryData, excludeNoCategory])
    useEffect(()=>{
        // console.log(calData)
        // console.log(calDifference)
        if (calData[0] !== undefined && !useDate){
            switch(calDifference){
                case true:
                    switch(calView){
                        case "totalExchanges":
                            Calendar(calData, {
                                x: d => d.date,
                                y: (d, i, data) => i > 0 ? (d.totalExchanges - data[i - 1].totalExchanges) / data[i - 1].totalExchanges : NaN,
                                yFormat: "+%",
                                weekday: "monday",
                                width: 630
                              }, calRef)
                            break
                        case "avgExchanges":
                            Calendar(calData, {
                                x: d => d.date,
                                y: (d, i, data) => i > 0 ? (d.avgExchanges - data[i - 1].avgExchanges) / data[i - 1].avgExchanges : NaN,
                                yFormat: "+%",
                                weekday: "monday",
                                width: 630
                                }, calRef)
                            break
                        case "totalConvos":
                            Calendar(calData, {
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
                            Calendar(calData, {
                                x: d => d.date,
                                y: d => d.totalExchanges,
                                weekday: "monday",
                                width: 630
                              }, calRef)
                            break
                        case "avgExchanges":
                            Calendar(calData, {
                                x: d => d.date,
                                y: d => d.avgExchanges,
                                weekday: "monday",
                                width: 630
                                }, calRef)
                            break
                        case "totalConvos":
                            Calendar(calData, {
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
        
    }, [calData, calView, calDifference])
    
    useEffect(()=>{
        switch(mapView){
            case "world":
                Choropleth(countryUsers, {
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
                Choropleth(regionUsers, {
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
        
    }, [countryUsers, mapView])
    useEffect(()=>{
        BarChart(jobs, {
            x: d => d.frequency,
            y: d => d.name,
            yDomain: d3.groupSort(jobs, ([d]) => -d.frequency, d => d.name), // sort by descending frequency
            xFormat: "%",
            xLabel: "Frequency →",
            width: 640,
            color: "steelblue",
            marginLeft: 100,
            marginRight: 20
          }, jobRef)
    }, [jobs])
    useEffect(()=>{
        BarChart(chosenAppsData, {
            x: d => d.frequency,
            y: d => d.name,
            yDomain: d3.groupSort(chosenAppsData, ([d]) => -d.frequency, d => d.name), // sort by descending frequency
            xFormat: "%",
            xLabel: "Frequency →",
            width: 640,
            color: "steelblue",
            marginLeft: 100,
            marginRight: 20
          }, chosenAppsRef)
    }, [chosenAppsData])

    useEffect(()=>{
        var appTotal = 0
        var appCount = {}
        var appData = []
        var usersIncluded = 0
        // console.log(chosenAppsFilter)
        var dataTemp = data
        if (useDate){
            dataTemp = data.filter(user=>{
                const d1 = new Date(user.createdAt)
                return d1.getFullYear() === analysisDate.getFullYear() &&
                d1.getMonth() === analysisDate.getMonth() &&
                d1.getDate() === analysisDate.getDate(); 
            })
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
        setChosenAppsData(appData)
    }, [chosenAppsFilter, excludeNoChosenApps, analysisDate, useDate])


    function onDayChange(date) {
        setAnalysisDate(date);
      }

    return (
        <Box margin={"20px"}>  
            <Button isLoading={fetchingData} isDisabled={fetchingData} onClick={getData}> {data.length > 0 ? "Refresh data" : "You Need To Fetch Data"}</Button>
            <Text>Last Refresh Time: {refreshDate === null ? `${refreshDate}` : `${refreshDate.toLocaleDateString()} ${refreshDate.toLocaleTimeString()}`}</Text>
            <Button isDisabled={data.length===0} onClick={()=>{setUseDate(!useDate)}}>{useDate ? "Overview" : "Use Date"}</Button>
            <DatePicker selected={analysisDate} onChange={(date) => setAnalysisDate(date)} disabled={!useDate}/>
            <Button isDisabled={!useDate} onClick={()=>{setAnalysisDate(new Date())}}>Today</Button>
            <Text>Total amount of convos: {useDate ? data.filter(user=>{
                const d1 = new Date(user.createdAt)
                return d1.getFullYear() === analysisDate.getFullYear() &&
                d1.getMonth() === analysisDate.getMonth() &&
                d1.getDate() === analysisDate.getDate(); 
            }).length : data.length}</Text>
            <Text>Total ammount of prompts: {promptTotal}</Text>
            <Text>Avergae Convo length: {avgConvoLength}</Text>
            <Button onClick={()=>{setExcludeNoFeedback(!excludeNoFeedback)}}>{excludeNoFeedback ? "Include No Feedback" : "Exclude No Feedback"}</Button>
            <svg ref={piRef}/>
            <Button onClick={()=>{setExcludeNoCategory(!excludeNoCategory)}}>{excludeNoCategory ? "Include No Category" : "Exclude No Category"}</Button>
            <svg ref={categoryRef}/>
            <Select placeholder='Select option' defaultValue={"world"} onChange={(e)=>{setMapView(e.target.value)}}>
                <option value='world'>World</option>
                <option value='US'>US</option>
            </Select>
            <svg ref={worldRef}/>
            <svg ref={jobRef}/>
            
            {
                 !useDate && (
                 <>
                 <Select placeholder='Select option' defaultValue={"totalConvos"} onChange={(e)=>{setCalView(e.target.value)}}>
                    <option value='totalConvos'>Total Conversations</option>
                    <option value='totalExchanges'>Total Exchanges</option>
                    <option value='avgExchanges'>Average Exchanges</option>
                </Select>
                  <Button onClick={()=>{setCalDifference(!calDifference)}}>{calDifference ? "Show Total" : "Show Difference"}</Button>
                <svg ref={calRef}/>
                 </>)
            }
           
            <Button isDisabled={chosenAppsData.length===1&&chosenAppsData[0].name==="None"} onClick={()=>{setExcludeNoChosenApps(!excludeNoChosenApps)}}>{excludeNoChosenApps ? "Include No Chosen Apps" : "Exclude No Chosen Apps"}</Button>
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
    )
}


  

export default App