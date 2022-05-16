import React from "react";
import Layout from "../Layout";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell } from "recharts";
import { AreaChart, Area, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { QRCode } from "react-qrcode-logo";
import useWallet, { NF, TF, getError } from "../../useWallet";
import "./dashboard.scss";
import Icons from "../Assets";
import { tips, copyToClipboard } from "../../util";
import logo from "../../assets/qr-logo.png";
// import Networks from '../../config/networks.json'
import Coins from "../../config/coins.json";
import InputCodeDialog from "./InputCodeDialog";

const networks = require("../../config/networks.json") as NetworkType;
const coins = Coins as {
  [coin: string]: { title: string; chain: string; symbol: string };
};
const icons = {
  icicb: <Icons.ICICB />,
  eth: <Icons.ETH />,
  usdt: <Icons.USDT />,
  btc: <Icons.BTC />,
  bnb: <Icons.BNB />,
  ltc: <Icons.LTC />,
} as { [key: string]: JSX.Element };

interface PieType {
  name: string;
  value: number;
}
interface AreaType {
  time: number;
  price: number;
}
interface DashboardStatus {
  area: Array<AreaType>;
  pie: Array<PieType>;
  icicbUsd: number;
  total: number;
  chain: string;
  coin: string;
  /* walletAddress: string */
  showModal: boolean;
  errmsg: string;
}

interface DepositProps {
  onClose: Function;
  chain: string;
  coin: string;
}

const DepositDialog = ({ chain, coin, onClose }: DepositProps) => {
  const { wallets } = useWallet();
  const address = wallets[chain] || "";
  return (
    <div className="modal">
      <div className="modal-overlay"></div>
      <div className="modal-container">
        <div style={{ textAlign: "right" }}>
          <a className="modal-close" onClick={() => onClose()}>
            &times;
          </a>
        </div>
        <div className="row center mt3">
          <QRCode
            value={address}
            eyeRadius={5}
            size={250}
            bgColor="white"
            logoImage={logo}
            logoWidth={60}
            logoHeight={60}
          />
        </div>

        <div className="flex center middle mt3">
          {icons[coin]}
          <span style={{ marginLeft: 20 }}>{coins[coin].title}</span>
        </div>
        <div className="row center p1 mt2">
          <label
            style={{ color: "#eee", fontSize: "17px", wordBreak: "break-all" }}
          >
            {address}
          </label>
          <span
            style={{ cursor: "pointer", marginLeft: "5px" }}
            onClick={() => {
              copyToClipboard(address);
            }}
          >
            <Icons.copy width={25} height={25} />
          </span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const {
    user,
    updated,
    update,
    prices,
    balances,
    wallets,
    logs,
    txs,
    call,
    isPublic,
  } = useWallet();
  const [status, setStatus] = React.useState<DashboardStatus>({
    area: [],
    pie: [],
    icicbUsd: 0,
    total: 0,
    chain: "",
    coin: "",
    /* walletAddress: 	'', */
    showModal: false,
    errmsg: "",
  });
  const [pending, setPending] = React.useState<TxType[]>([]);
  const chartColors = {
    bnb: "#F3BA2F",
    btc: "#F7931A",
    eth: "#627EEA",
    icicb: "#e6be75",
    ltc: "#bebebe",
    usdt: "#26A17B",
  };

  React.useEffect(() => {
    let _pie = [] as Array<PieType>;
    let _area = [] as Array<AreaType>;
    let _total = 0;
    let icicb =
      (balances["icicb"]?.balance || 0) + (balances["icicb"]?.locked || 0);

    Object.keys(balances).map((i, k) => {
      const value =
        (prices[i] || 0) *
        (balances[i]?.balance || 0 + balances[i]?.locked || 0);
      _pie.push({ name: i, value });
      _total += value;
    });
    if (logs.date) {
      for (let i in logs.date) {
        if (logs.date[i].coin === "icicb") {
          _area.push({ time: logs.date[i].updated, price: logs.date[i].usd });
        }
      }
    }

    const data = txs
      .filter((i) => !i.confirmed)
      .sort((a, b) => b.created - a.created);

    setPending(data);
    setStatus({
      ...status,
      icicbUsd: icicb,
      total: _total,
      pie: _pie,
      area: _area,
    });
  }, [updated]);

  update({ currentPage: "dashboard" });

  const updateStatus = (params: { [key: string]: string | number | boolean }) =>
    setStatus({ ...status, ...params });

  const deposit = async (coin: string) => {
    const chain = coins[coin].chain;
    if (isPublic || !!user?.presale) {
      const net = networks[chain];
      const evm = chain === "evm" || (net && net.evm);
      const address = evm ? wallets?.evm : wallets?.[chain];
      if (address) {
        updateStatus({ chain, coin, showModal: true });
      } else {
        update({ loading: true });
        const response = await call("/get-user-wallet", {
          chain: evm ? "evm" : chain,
        });
        if (response !== null) {
          if (response.error !== undefined) {
            tips(getError(response.error));
          } else {
            if (response.result === false) {
              tips("Cannot found wallet address");
              updateStatus({ walletAddress: "" });
            } else {
              if (evm) {
                update({
                  wallets: { ...wallets, evm: response.result.address },
                  loading: false,
                });
              } else {
                update({
                  wallets: { ...wallets, [chain]: response.result.address },
                  loading: false,
                });
              }
              updateStatus({ chain, coin, errmsg: "", showModal: true });
              return;
            }
          }
        } else {
          updateStatus({ errmsg: getError(0) });
        }
        update({ loading: false });
      }
    } else {
      updateStatus({ showModal: true });
    }
  };

  const onCloseDialog = () => {
    updateStatus({ showModal: false });
  };
  const zeroBalance = status.pie.length === 0;

  return (
    <Layout>
      <div className="dashboard">
        <div className="row center">
          {Object.keys(coins).map((i, k) => (
            <div
              key={k}
              className="btn-deposit"
              style={{ borderBottom: "1px solid" + chartColors[i] }}
              onClick={() => {
                i !== "icicb" && deposit(i);
              }}
            >
              {icons[i]}{" "}
              <label style={{ color: chartColors[i], marginLeft: 5 }}>
                {coins[i].symbol}
              </label>
            </div>
          ))}
        </div>
        <div className="row mt5 no-gutters">
          <div className="col-xl-6" style={{ order: 2 }}>
            <h1
              style={{
                textAlign: "center",
                paddingBottom: 8,
                borderBottom: " 1px solid rgb(71 63 63)",
              }}
            >
              ICICB <i>Graph</i>
            </h1>
            <div style={{ height: 300 }}>
              <ResponsiveContainer>
                <AreaChart
                  style={{ width: "100%" }}
                  height={200}
                  data={status.area}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="none"
                    fill="#a0844f"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-xl-6" style={{ order: 4 }}>
            <h1
              style={{
                textAlign: "center",
                paddingBottom: 8,
                borderBottom: " 1px solid rgb(71 63 63)",
              }}
            >
              <i>Total Balance</i>
            </h1>
            <div className="row">
              <div className="col-lg-6 col-md-12">
                <div
                  style={{
                    height: 300,
                    position: "relative",
                    display: "flex",
                    borderLeft: " 1px solid rgb(71 63 63)",
                    paddingLeft: "3em",
                    justifyContent: "center",
                  }}
                >
                  <ResponsiveContainer width={220}>
                    <PieChart width={220} height={220}>
                      <Pie
                        data={zeroBalance ? [{ value: 100 }] : status.pie}
                        innerRadius={85}
                        outerRadius={105}
                        stroke="none"
                        paddingAngle={zeroBalance ? 0 : 5}
                        dataKey="value"
                      >
                        {zeroBalance ? (
                          <Cell fill="#222" />
                        ) : (
                          status.pie.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={chartColors[entry.name]}
                            />
                          ))
                        )}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      color: "grey",
                      position: "absolute",
                      left: "3em",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <b style={{ fontSize: "24px", color: "white" }}>
                      ${NF(status.total || 0)}
                    </b>
                  </div>
                </div>
              </div>
              <div className="col-lg-6  col-md-12">
                {Object.keys(coins).map((i, k) => (
                  <div
                    className="balance"
                    onClick={(e) => {
                      deposit(coins[i].chain);
                    }}
                    key={k}
                  >
                    <div
                      style={{
                        padding: "0 10px 0 3px",
                        display: "flex",
                        alignItems: "center",
                        borderRight: "1px solid grey",
                      }}
                    >
                      {icons[i]}
                    </div>
                    <label style={{ paddingLeft: "15px" }}>
                      {balances[i]?.balance || 0 + balances[i]?.locked || 0}{" "}
                    </label>
                    <span className="deposit-icon">{coins[i].symbol}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="hr mt5"></div>
        <div className="row mt3">
          <div className="col-xl-6">
            <h3>
              <span className="grey">
                <i>ICICB total balance</i>
              </span>{" "}
              {NF(isNaN(status.icicbUsd) ? 0 : status.icicbUsd)}
            </h3>
          </div>
          <div className="col-xl-6 row center">
            <Link
              className="submit active"
              style={{ width: 120, textAlign: "center" }}
              to="/presale"
              onClick={() => {
                update({ currentPage: "presale" });
              }}
            >
              BUY
            </Link>
            <button disabled className="submit" style={{ width: 120 }}>
              WITHDRAW
            </button>
          </div>
        </div>
        <p style={{ color: "red", textAlign: "center" }}>{status.errmsg}</p>

        {pending.length ? (
          <div className="txs">
            <h1>Pending Transactions</h1>
            <div className="row hr">
              <div className="col-md-3">Time</div>
              <div className="col-md-3">Address</div>
              <div className="col-md-3 right">Amount</div>
              <div className="col-md-3 right">Status</div>
            </div>
            {pending.map((i, index) => (
              <div className="row" key={index}>
                <div className="col-md-3">
                  <label>Time: </label>
                  {TF(i.created)}
                </div>
                <div className="col-md-3">
                  <label>Address: </label>
                  {i.address.slice(0, 10) + "..." + i.address.slice(-10)}
                </div>
                <div className="col-md-3 right">
                  <label>Amount: </label>
                  {i.amount} {i.coin.toUpperCase()}
                </div>
                <div className="col-md-3 right">
                  <label>Status: </label>
                  {i.confirms + " / " + networks[i.chain].confirmations}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {status.showModal ? (
          isPublic || !!user?.presale ? (
            <DepositDialog
              chain={status.chain}
              coin={status.coin}
              onClose={onCloseDialog}
            />
          ) : (
            <InputCodeDialog onClose={onCloseDialog} />
          )
        ) : null}
      </div>
    </Layout>
  );
};

export default Dashboard;
