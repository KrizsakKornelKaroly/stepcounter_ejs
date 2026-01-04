-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Jan 04. 22:51
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `2025_stepcounter_ejs`
--
CREATE DATABASE IF NOT EXISTS `2025_stepcounter_ejs` DEFAULT CHARACTER SET utf8 COLLATE utf8_hungarian_ci;
USE `2025_stepcounter_ejs`;

-- --------------------------------------------------------

--
-- A nézet helyettes szerkezete `statistics`
-- (Lásd alább az aktuális nézetet)
--
CREATE TABLE `statistics` (
`uId` int(11)
,`name` varchar(100)
,`sumSteps` decimal(32,0)
,`maxSteps` int(11)
,`maxStepDate` date
,`avgSteps` decimal(14,4)
);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `steps`
--

CREATE TABLE `steps` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `steps` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `steps`
--

INSERT INTO `steps` (`id`, `user_id`, `date`, `steps`) VALUES
(1, 1, '2025-11-21', 8542),
(2, 1, '2025-11-22', 12305),
(3, 1, '2025-11-23', 9876),
(4, 1, '2025-11-24', 6234),
(5, 1, '2025-11-25', 11458),
(6, 1, '2025-11-26', 10892),
(7, 1, '2025-11-27', 13456),
(8, 1, '2025-11-28', 7845),
(9, 1, '2025-11-29', 9234),
(10, 1, '2025-11-30', 5678),
(11, 1, '2025-12-01', 4823),
(12, 1, '2025-12-02', 11234),
(13, 1, '2025-12-03', 9567),
(14, 1, '2025-12-04', 13892),
(15, 1, '2025-12-05', 10456),
(16, 1, '2025-12-06', 8734),
(17, 1, '2025-12-07', 6892),
(18, 1, '2025-12-08', 5234),
(19, 1, '2025-12-09', 12678),
(20, 1, '2025-12-10', 11345),
(21, 1, '2025-12-11', 9823),
(22, 1, '2025-12-12', 14234),
(23, 1, '2025-12-13', 10567),
(24, 1, '2025-12-14', 7456),
(25, 1, '2025-12-15', 5123),
(26, 1, '2025-12-16', 13567),
(27, 1, '2025-12-17', 11892),
(28, 1, '2025-12-18', 9345),
(29, 1, '2025-12-19', 12456),
(30, 1, '2025-12-20', 8968),
(32, 1, '2025-12-21', 6556);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(60) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`) VALUES
(1, 'Kis József', 'admin@turr.hu', '703d9bac79dd114e166301432de9a11c28d14318', '2025-12-21 00:00:00'),
(2, 'TestAccount2', 'test@turr.hu', '703d9bac79dd114e166301432de9a11c28d14318', '2025-12-21 20:57:10');

-- --------------------------------------------------------

--
-- Nézet szerkezete `statistics`
--
DROP TABLE IF EXISTS `statistics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `statistics`  AS SELECT `st`.`user_id` AS `uId`, (select `users`.`name` from `users` where `users`.`id` = `st`.`user_id`) AS `name`, sum(`st`.`steps`) AS `sumSteps`, max(`st`.`steps`) AS `maxSteps`, (select `steps`.`date` from `steps` order by `steps`.`steps` desc limit 1) AS `maxStepDate`, avg(`st`.`steps`) AS `avgSteps` FROM `steps` AS `st` GROUP BY `st`.`user_id` ;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `steps`
--
ALTER TABLE `steps`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `date` (`date`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `steps`
--
ALTER TABLE `steps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `steps`
--
ALTER TABLE `steps`
  ADD CONSTRAINT `steps_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
