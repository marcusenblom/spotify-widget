import axios from "axios";
import Widget from "components/Widget/Widget";
import { useEffect, useState } from "react"

export default function WidgetPage() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    useEffect(()=>{
        fetchNowPlaying();
    }, []);

    async function fetchNowPlaying(){
        var config = {
            method: 'GET',
            url: `/api/nowPlaying`,
            headers: {  
                'Content-Type': 'application/json'
            },
        };

        setLoading(true);
    
        let res = axios(config).then(function (response) {
            return response?.data;
        }).catch(function (error) {
            return error?.response?.data;
        });

        if(res){
            setData(res);
        } else {
            setData(null);
        }

        setLoading(false);
    }

	return (
		<>
            {
                !data && loading ? "Loading.."
                : data && <Widget />
            }

            <button onClick={fetchNowPlaying}>Refetch</button>
        </>
	)
}
