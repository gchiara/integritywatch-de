<!DOCTYPE html>
<html lang="en">
<head>
  <?php include 'gtag.php' ?>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Integrity Watch Deutschland</title>
  <meta property="og:url" content="http://integritywatch.transparency.de/" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Integrity Watch Deutschland" />
  <meta property="og:description" content="Integrity Watch Deutschland" />
  <meta property="og:image" content="http://integritywatch.transparency.de/images/thumbnail.jpg" />
  <link rel='shortcut icon' type='image/x-icon' href='/favicon.ico' />
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,500,700,800" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Quicksand:500" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,800" rel="stylesheet">
  <link rel="stylesheet" href="fonts/oswald.css">
  <link rel="stylesheet" href="static/organizations.css?v=3">
</head>
<body>
    <div id="app" class="organizations-page">   
      <?php include 'header.php' ?>
      <!-- TOP AREA -->
      <div class="container-fluid top-description-container" v-if="showInfo">
        <div class="row">
          <div class="col-md-12 top-description-content">
            <div class="top-description-text">
              <h1>INTEGRITY WATCH DEUTSCHLAND</h1>
              <h2>Diese interaktive Datenbank bietet einen Einblick in die Daten aus dem Lobbyregister – aufbereitet zur individuellen grafischen Recherche.</h2>
              <a class="read-more-btn" href="./about.php?section=4">Mehr erfahren</a>
              <button class="social-share-btn twitter-btn" @click="share('twitter')"><img src="./images/twitter-nobg.png" />Auf Twitter teilen</button>
              <button class="social-share-btn  facebook-btn" @click="share('facebook')"><img src="./images/facebook-nobg.png" />Auf Facebook teilen</button>
              <p>Durch einfaches Anklicken der Inhalte in den Diagrammen und Listen unten können Sie die Interessengruppen sortieren und filtern.</p>
            </div>
            <i class="material-icons close-btn" @click="showInfo = false">close</i>
          </div>
        </div>
      </div>
      <!-- MAIN -->
      <div class="container-fluid dashboard-container-outer">
        <div class="row dashboard-container">
          <!-- CHARTS - FIRST ROW -->
          <div class="col-md-8 chart-col">
            <div class="boxed-container chart-container organizations_1">
              <chart-header :title="charts.fieldsOfInterest.title" :info="charts.fieldsOfInterest.info" ></chart-header>
              <div class="chart-inner" id="foi_chart"></div>
            </div>
          </div>
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container organizations_2">
              <chart-header :title="charts.legalForm.title" :info="charts.legalForm.info" ></chart-header>
              <div class="chart-inner" id="legalform_chart"></div>
            </div>
          </div>
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container organizations_3">
              <chart-header :title="charts.activity.title" :info="charts.activity.info" ></chart-header>
              <div class="chart-inner" id="activity_chart"></div>
            </div>
          </div>
          <div class="col-md-8 chart-col">
            <div class="boxed-container chart-container organizations_4">
              <chart-header :title="charts.financialExpense.title" :info="charts.financialExpense.info" ></chart-header>
              <div class="chart-inner" id="financialexpense_chart"></div>
            </div>
          </div>
          <!-- TABLE -->
          <div class="col-12 chart-col">
            <div class="boxed-container chart-container chart-container-table">
              <chart-header :title="charts.table.title" :info="charts.table.info" ></chart-header>
              <div class="chart-inner chart-table">
                <table class="table table-hover dc-data-table" id="dc-data-table">
                  <thead>
                    <tr class="header">
                      <th class="header">Nr</th> 
                      <th class="header">Name</th> 
                      <th class="header">Rechtsform</th> 
                      <th class="header">Anzahl Beschäftigte in Interessenvertretung</th> 
                      <th class="header">Mitgliedschaften</th> 
                      <th class="header table-header-organisations-expense">Finanzielle Aufwendungen der Interessenvertretung</th>
                      <th class="header">Land</th> 
                      <th class="header">Geahndete Verstöße</th> 
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </div>
          <div class="footer-link col-12"><a href="https://www.transparency.de/rechtliches/impressum" target="_blank">Impressum</a></div>
        </div>
      </div>
      <!-- Bottom bar -->
      <div class="container-fluid footer-bar">
        <div class="row">
          <div class="footer-col col-8 col-sm-4">
            <div class="footer-input">
              <input type="text" id="search-input" placeholder="Nach Organisation filtern">
              <i class="material-icons">search</i>
            </div>
          </div>
          <div class="footer-col col-4 col-sm-8 footer-counts">
            <div class="dc-data-count count-box">
              <div class="filter-count">0</div>von <strong class="total-count">0</strong> Lobbyorganisationen
            </div>
          </div>
        </div>
        <!-- Reset filters -->
        <button class="reset-btn"><i class="material-icons">settings_backup_restore</i><span class="reset-btn-text">Filter zurücksetzen</span></button>
      </div>
      <!-- DETAILS MODAL -->
      <div class="modal" id="detailsModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="modal-title">
                <div class="name" :style="{ color: selectedOrg.Color }">{{ selectedOrg.name }}</div>
              </div>
              <button type="button" class="close" data-dismiss="modal"><i class="material-icons">close</i></button>
            </div>
            <!-- Modal body -->
            <div class="modal-body">
              <div class="container">
                <div class="row">
                  <div class="col-md-12">
                    <div class="details-line"><span class="details-line-title">Rechtsform:</span> {{ selectedOrg.legalForm }}</div>
                    <div class="details-line" v-if="selectedOrg.fois"><span class="details-line-title">Interessen- und Vorhabenbereiche:</span> {{ selectedOrg.fois.join(', ') }}</div>
                    <div class="details-line" v-if="selectedOrg.finExpCategoryFull && selectedOrg.finExpCategoryFull.length > 0"><span class="details-line-title">Jährliche finanzielle Aufwendungen:</span> {{ selectedOrg.finExpCategoryFull }}</div>
                    <div class="details-line" v-if="selectedOrg.employees"><span class="details-line-title">Anzahl der Beschäftigten im Bereich der Interessenvertretung:</span> {{ selectedOrg.employees }}</div>
                    <div class="details-line" v-if="selectedOrg.memberships"><span class="details-line-title">Mitgliedschaften:</span> {{ selectedOrg.memberships }}</div>
                    <div class="details-line" v-if="selectedOrg.registerNumber"><a :href="'https://www.lobbyregister.bundestag.de/suche/'+selectedOrg.registerNumber" target="_blank">Organisationsprofil anzeigen auf lobbyregister.bundestag.de</a></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Loader -->
      <loader v-if="loader" :text="''" />
    </div>

    <script type="text/javascript" src="vendor/js/d3.v5.min.js"></script>
    <script type="text/javascript" src="vendor/js/d3.layout.cloud.js"></script>
    <script type="text/javascript" src="vendor/js/crossfilter.min.js"></script>
    <script type="text/javascript" src="vendor/js/dc.js"></script>
    <script type="text/javascript" src="vendor/js/dc.cloud.js"></script>

    <script src="static/organizations.js?v=3"></script>

 
</body>
</html>