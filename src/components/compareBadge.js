import { ArrowDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import { Flex, Text } from "@chakra-ui/react";

export default function CompareBadge(props){
    const {current, prev} = props
    console.log({current, prev})
    return (
     <>
        {prev !== null && 
            <>
            {(current - prev)/prev >= 0 ? (
                <>
                <Flex  alignItems={"center"} backgroundColor={"#ECFDF3"} padding={"2px 10px 2px 8px"} borderRadius={"16px"} marginLeft={"auto"} alignSelf={"center"}>
                    <ArrowUpIcon boxSize={"5"} color={"#12B76A"}/>
                    <Text color={"#027A48"}  fontWeight={"500"}>{(Math.abs((current - prev)/prev)*100).toFixed(1)}%</Text>
                </Flex>
                </>
            ) : (
                <>
                <Flex  alignItems={"center"} backgroundColor={"#FEF3F2"} padding={"2px 10px 2px 8px"} borderRadius={"16px"} marginLeft={"auto"} alignSelf={"center"}>
                    <ArrowDownIcon boxSize={"5"} color={"#F04438"}/>
                    <Text color={"#B42318"}  fontWeight={"500"}>{(Math.abs((current - prev)/prev)*100).toFixed(1)}%</Text>
                </Flex>
                </>
            )}
            </>
                               
        }
     </>   
    )
}