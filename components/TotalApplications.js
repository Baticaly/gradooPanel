import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js'

let graphoptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: {
      display: false,
    },
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
}

export default function TotalApplications() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const [graphdata, setgraphdata] = useState({
    labels: [],
    datasets: [
      {
        label: 'Unique',
        data: []
      },
      {
        label: 'Duplicate',
        data: []
      }
    ],
  });

  useEffect(() => {

    async function geteventlist() {
      var timeline = []
      var graphtimeline = []

      var d = new Date();
      for (var i = -1; i < 14; i++) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        timeline.push(d.toISOString());
      }

      var d = new Date();
      for (var i = 13; i > -1; i--) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        graphtimeline.push(`${d.getDate()}`);
      }

      //
      let eventlist = []
      const { data } = await supabase.rpc('distinctevent')
      data.forEach(e => {
        eventlist.push({ eventid: e.event })
      });

      //
      for (var i = 0; i < eventlist.length; i++) {
        const { data, error } = await supabase.rpc('eventcount', { eventname: eventlist[i].eventid })
        eventlist[i].total = data;
      }

      //
      for (var i = 0; i < eventlist.length; i++) {
        const { data, error } = await supabase.rpc('eventdistinctcount', { eventname: eventlist[i].eventid })
        eventlist[i].distinct = data;
      }

      //
      const getdistinctuser = async () => {
        const { data } = await supabase.rpc('distinctuser')
        eventlist.push({
          eventid: "Total Unique Applicants",
          distinct: data,
        });
      }
      await getdistinctuser()

      //
      let eventlabels = []
      let eventtotal = []
      let eventdistinct = []
      let eventtimeline = []

      for (let i = 0; i < eventlist.length; i++) {
        eventlabels.push(eventlist[i].eventid);
        eventtotal.push(eventlist[i].total - eventlist[i].distinct);
        eventdistinct.push(eventlist[i].distinct);

        var timelinecache = [];
        // Daily application Count
        for (var t = 0; t < 14; t++) {
          const gettimeline = async () => {
            const { data } = await supabase.rpc('eventapplicationcount', { eventname: 'applications', gte: timeline[14 - t], lt: timeline[13 - t] })
            timelinecache.push(data);
          }
          await gettimeline()
        }

        eventlist[i].timeline = timelinecache;
        eventtimeline.push(eventlist[i].timeline);
      }

      setgraphdata({
        labels: eventlabels,
        datasets: [
          {
            label: 'Unique',
            data: eventdistinct,
            backgroundColor: [
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 206, 86, 0.2)",
            ],
            borderColor: [
              "rgba(54, 162, 235, 1)",
              "rgba(255, 159, 64, 1)",
              "rgba(255, 206, 86, 1)",
            ],
            borderWidth: 1,
          },
          {
            label: 'Duplicate',
            data: eventtotal,
            backgroundColor: [
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
            ],
            borderColor: [
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ],
            borderWidth: 1,
          }
        ],
      })
    }

    //getApplicationCount(timeline)
    //gettotalapp(timeline)
    geteventlist()

  }, []);

  
  return (
    <>
      <Bar options={graphoptions} data={graphdata} />
    </>
  );
}


// Total Application
async function gettotalapp(timeline) {
  let timelineintegral = []
  for (var i = 0; i < 14; i++) {
    const { data } = await supabase
      .from("applications")
      .select()
      .lt("submitted_at", timeline[13 - i])
    timelineintegral.push(data);
  }
}

// Application Count
async function getApplicationCount(timeline) {

  var applist = []
  for (var i = 0; i < 14; i++) {
    const { data } = await supabase
      .from("applications")
      .select()
      .gte("submitted_at", timeline[14 - i])
      .lt("submitted_at", timeline[14 - i])
    applist.push(data);
  }
}

// Get usertype
async function getusercount() {
  let userTypes = []
  let userCount = []

  const { data } = await supabase.rpc('distinctusertype')
  data.forEach(u => {
    userTypes.push(u.usertype);
  });

  userTypes.forEach(async usertype => {
    const usertypecount = async () => {
      const { data } = await supabase.rpc('usertypecount', { usertypeinput: usertype })
      userCount.push(data);
    }
    await usertypecount()
  });
}