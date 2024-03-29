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

export default function TotalApplications(dateValue) {
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
      let eventuniquetotal = []
      let distinctusercount = 0

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
      const { data, error } = await supabase
        .from('campaigns')
        .select()
      data.forEach(e => {
        eventlist.push({ eventid: e.title, eventCode: e.code })
      });

      //
      for (var i = 0; i < eventlist.length; i++) {
        const { data, error } = await supabase.rpc('eventcount_by_time', { eventname: eventlist[i].eventid, from_input: dateValue.startDate, until_input: dateValue.endDate })
        eventlist[i].total = data[0].count;
      }

      //
      for (var i = 0; i < eventlist.length; i++) {
        const { data, error } = await supabase.rpc('eventdistinctcount_by_time', { eventname: eventlist[i].eventid, from_input: dateValue.startDate, until_input: dateValue.endDate })
        eventlist[i].distinct = data[0].count;
      }

      //
      const getdistinctuser = async () => {
        const { data } = await supabase.rpc('distinctuser_by_time', { from_input: dateValue.startDate, until_input: dateValue.endDate })
        distinctusercount = data[0].count
      }
      await getdistinctuser()

      //
      let eventlabels = []
      let eventtotal = []
      let eventdistinct = []

      for (let i = 0; i < eventlist.length; i++) {
        if (eventlist[i].total > 0) {
          eventlabels.push(eventlist[i].eventCode);
          eventtotal.push(eventlist[i].total - eventlist[i].distinct);
          eventdistinct.push(eventlist[i].distinct);
        }
      }

      eventlabels.push('Total Unique')
      for (let i = 0; i < eventtotal.length; i++) { eventuniquetotal.push(0) }
      eventuniquetotal.push(distinctusercount)

      setgraphdata({
        labels: eventlabels,
        datasets: [
          {
            label: 'Unique',
            data: eventdistinct,
            backgroundColor: [
              "rgba(54, 162, 235, 0.2)",

            ],
            borderColor: [
              "rgba(54, 162, 235, 1)",

            ],
            borderWidth: 1,
          },
          {
            label: 'Duplicate',
            data: eventtotal,
            backgroundColor: [
              "rgba(255, 206, 86, 0.2)",
            ],
            borderColor: [
              "rgba(255, 206, 86, 1)",
            ],
            borderWidth: 1,
          },
          {
            label: 'Total Unique',
            data: eventuniquetotal,
            backgroundColor: [
              "rgba(255, 100, 30, 0.2)",
            ],
            borderColor: [
              "rgba(255, 100, 30, 1)",
            ],
            borderWidth: 1,
          }
        ],
      })
    }

    //getApplicationCount(timeline)
    //gettotalapp(timeline)
    geteventlist()

  }, [dateValue]);


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