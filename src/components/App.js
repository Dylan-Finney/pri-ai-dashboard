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


export default function App(props) {
    const piRef = useRef(null)
    const worldRef = useRef(null)
    const jobRef = useRef(null)
    const calRef = useRef(null)
    var countries = topojson.feature(world, world.objects.countries)
    var countrymesh = topojson.mesh(world, world.objects.countries, (a, b) => a !== b)
    var rename = new Map([["United States", "United States of America"]])
    var states = topojson.feature(us, us.objects.states)
    var statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b)
    var namemap = new Map(states.features.map(d => [d.properties.name, d.id]))

    const [excludeNoFeedback, setExcludeNoFeedback] = useState(false)
    const [data, setData] = useState([])
    const [fetchingData, setFetchingData] = useState(false)
    const [calData, setCalData] = useState([])
    const [avgConvoLength, setAvgConvoLength] = useState(0)
    const [countryUsers, setCountryUsers] = useState([])
    const [regionUsers, setRegionUsers] = useState([])
    const [helpfulCount, setHelpfulCount] = useState([])
    const [jobs, setJobs] = useState([])
    const [mapView, setMapView] = useState("world")
    const [calView, setCalView] = useState("totalConvos")
    const [calDifference, setCalDifference] = useState(false)
    // const [data, feedback] = useState([])
    const getData =  async () => {
        setFetchingData(true)
        try{
            const response = await axios({
                method: "GET",
                url: "/api/refresh"
            })
            setData(response.data.data)
        } catch(e){
            console.error(e)
        }
        setFetchingData(false)
    }
    useEffect(()=>{
        var helpful = [{name: "Helpful", value: 0},{name: "Unhelpful", value: 0},{name: "No feedback", value: 0}]
        var jobTotal = 0
        var countryCount = {}
        var regionCount = {}
        var jobCount = {}
        var calCount = {}
        var countryData = []
        var regionData = []
        var jobData = []
        var calData = []
        var convoLength = 0
        data.map(user=>{
            var convoDateObj = new Date(user.exchanges[0].createdAt)
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
            })
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
        calData = calData.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });
        console.log(calData)
        setCountryUsers(countryData)
        setRegionUsers(regionData)
        setHelpfulCount(helpful)
        setJobs(jobData)
        setAvgConvoLength(convoLength/data.length)
        setCalData(calData)
    },[data])

    useEffect(()=>{
        PieChart(helpfulCount.filter(entry => entry.value > 0 && !(entry.name === "No feedback" && excludeNoFeedback)),{
            name: d => d.name,
            value: d => d.value,
            width: 640,
            height: 500
        }, piRef)
    }, [helpfulCount, excludeNoFeedback])
    useEffect(()=>{
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
                    default:
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
            default:
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
                    default:
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
            marginLeft: 100
          }, jobRef)
    }, [jobs])

    return (
        <Box margin={"20px"}>  
            <Button isLoading={fetchingData} isDisabled={fetchingData} onClick={getData}>Refresh data</Button>
            <Text>Total amount of convos: {data.length}</Text>
            <Text>Avergae Convo length: {avgConvoLength}</Text>
            <Button onClick={()=>{setExcludeNoFeedback(!excludeNoFeedback)}}>{excludeNoFeedback ? "Include No Feedback" : "Exclude No Feedback"}</Button>
            <svg ref={piRef}/>
            <Select placeholder='Select option' defaultValue={"world"} onChange={(e)=>{setMapView(e.target.value)}}>
                <option value='world'>World</option>
                <option value='US'>US</option>
            </Select>
            <svg ref={worldRef}/>
            <svg ref={jobRef}/>
            <Select placeholder='Select option' defaultValue={"totalConvos"} onChange={(e)=>{setCalView(e.target.value)}}>
                <option value='totalConvos'>Total Conversations</option>
                <option value='totalExchanges'>Total Exchanges</option>
                <option value='avgExchanges'>Average Exchanges</option>
            </Select>
            <Button onClick={()=>{setCalDifference(!calDifference)}}>{calDifference ? "Show Total" : "Show Difference"}</Button>
            <svg ref={calRef}/>

        </Box>
    )
}