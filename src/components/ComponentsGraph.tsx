import axios from "axios";
import gradstop from "gradstop";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COMPONENTS: Record<
  string,
  Array<{ symbol: string; coingeckoApiId: string }>
> = {
  DPI: [
    {
      symbol: "UNI",
      coingeckoApiId: "uniswap",
    },
    {
      symbol: "AAVE",
      coingeckoApiId: "aave",
    },
    {
      symbol: "MKR",
      coingeckoApiId: "maker",
    },
    {
      symbol: "SUSHI",
      coingeckoApiId: "sushi",
    },
    {
      symbol: "COMP",
      coingeckoApiId: "compound-governance-token",
    },
    {
      symbol: "SNX",
      coingeckoApiId: "havven",
    },
    {
      symbol: "YFI",
      coingeckoApiId: "yearn-finance",
    },
    {
      symbol: "REN",
      coingeckoApiId: "republic-protocol",
    },
    {
      symbol: "LRC",
      coingeckoApiId: "loopring",
    },
    {
      symbol: "KNC",
      coingeckoApiId: "kyber-network-crystal",
    },
    {
      symbol: "BAL",
      coingeckoApiId: "balancer",
    },
    {
      symbol: "BADGER",
      coingeckoApiId: "badger-dao",
    },
    {
      symbol: "FARM",
      coingeckoApiId: "harvest-finance",
    },
    {
      symbol: "INST",
      coingeckoApiId: "instadapp",
    },
    {
      symbol: "CREAM",
      coingeckoApiId: "cream-2",
    },
    {
      symbol: "VSP",
      coingeckoApiId: "vesper-finance",
    },
    {
      symbol: "MTA",
      coingeckoApiId: "meta",
    },
  ],
};

const DAYS = 30;

async function getMarketCapData(id: string) {
  const apiUrl = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${DAYS}&interval=daily`;
  const response = await axios.get(apiUrl);

  const marketCapsUSD = response.data.market_caps.map(
    (arr: number[]) => arr[1]
  );
  return marketCapsUSD;
}

function ComponentsGraph(props: { name: string }) {
  const dates = Array.from({ length: DAYS + 1 }, (_, index) => {
    return {
      date: new Date(new Date().setDate(new Date().getDate() - (DAYS - index))),
    };
  });
  const [marketCapData, setMarketCapData] =
    useState<Array<Record<string, any>>>(dates);
  useEffect(() => {
    for (const { symbol, coingeckoApiId } of COMPONENTS[props.name]) {
      getMarketCapData(coingeckoApiId).then((marketCapsUSD) => {
        const newMarketCapData = marketCapData;
        marketCapsUSD.forEach((value: number, i: number) => {
          newMarketCapData[i][symbol] = value;
        });

        setMarketCapData(newMarketCapData);
      });
    }
  });

  const gradient = gradstop({
    stops: COMPONENTS[props.name].length,
    inputFormat: "hex",
    colorArray: ["#343838", "#00DFFC"],
  });
  console.log(gradient);

  function formatToBnUSD(value: number) {
    return `$ ${new Number(value / 1000000000).toPrecision(4)}bn`;
  }

  function calculateTotalMarketCap(values: Record<string, any>) {
    const sum = Object.entries(values).reduce((total, pair) => {
      const [name, value]: [string, any] = pair;
      if (name !== "date") return total + value;
      return total;
    }, 0);
    return sum;
  }

  const totalCurrentMarketCap = calculateTotalMarketCap(
    marketCapData.at(-1) ?? {}
  );

  return (
    <div className="ComponentsGraph">
      <h1>
        {props.name} - Total Component Market Cap: {formatToBnUSD(totalCurrentMarketCap)}
      </h1>
      <ResponsiveContainer width="100%" aspect={3}>
        <AreaChart
          width={500}
          height={400}
          data={marketCapData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => value.toLocaleDateString()}
          />
          <YAxis tickFormatter={(value) => `$ ${value / 1000000000}bn`} />
          <Tooltip
            labelFormatter={(value, payload) => {
              const values = payload[0]?.payload;
              if (values != null) {
                const sum = calculateTotalMarketCap(values);
                const sumString = formatToBnUSD(sum);
                return `${value.toLocaleDateString()} - Total: ${sumString}`;
              }
              return value.toLocaleDateString();
            }}
            formatter={formatToBnUSD}
          />
          {COMPONENTS[props.name].map(({ symbol }, index) => (
            <Area
              type="monotone"
              dataKey={symbol}
              key={symbol}
              stackId="1"
              stroke={gradient[index]}
              fill={gradient[index]}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ComponentsGraph;
