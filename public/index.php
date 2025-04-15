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
  <link rel="stylesheet" href="fonts/helveticaneue.css?v=1">
  <link rel="stylesheet" href="static/lobbyists.css?v=9">
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
              <h2>Diese interaktive Datenbank bietet einen Einblick in die Daten aus dem Lobbyregister – aufbereitet zur individuellen grafischen Recherche. Die Daten werden täglich aktualisiert.</h2>
              <p>Durch einfaches Anklicken der Inhalte in den Diagrammen und Listen unten können Sie die Interessengruppen sortieren und filtern. Mit der Reform des Lobbyregisters können Sie nun nicht nur nachvollziehen, welche Interessensvertreter:innen versucht haben, bestimmte Gesetze oder Stellungnahmen zu beeinflussen, sondern auch deren inhaltliche Positionen und Argumente einsehen. Geben Sie dazu das gewünschte Gesetz oder Drucksache in das untere Suchfeld ein.</p>
              <button class="social-share-btn twitter-btn" @click="share('twitter')"><img src="./images/x_logo-black.png" />Auf X teilen</button>
              <button class="social-share-btn  facebook-btn" @click="share('facebook')"><img src="./images/facebook-nobg.png" />Auf Facebook teilen</button>
              <button class="social-share-btn  linkedin-btn" @click="share('linkedin')"><img src="./images/in_logo.png" />Auf LinkedIn teilen</button>
            </div>
            <i class="material-icons close-btn" @click="showInfo = false">close</i>
          </div>
        </div>
      </div>
      <!-- MAIN -->
      <div class="container-fluid dashboard-container-outer">
        <div class="row dashboard-container">
          <!-- NEW/OLD DATA SELECTOR -->
          <div class="col-md-12 chart-col version-select-container">
            <a href="./" class="link-button active">Aktuelle Daten {{ cleanUpdateTimestamp(dataUpdateDate) }}</a>
            <!-- <a href="./lobbyists_old.php" class="link-button">Daten von 13/06/2023</a> -->
          </div>
          <!-- CHARTS - FIRST ROW -->
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container organizations_1" id="fieldsofinterest_chart_container">
              <chart-header :title="charts.fieldsOfInterest.title" :info="charts.fieldsOfInterest.info" :chartid="charts.fieldsOfInterest.id"></chart-header>
              <div class="chart-inner" id="foi_chart"></div>
              <div class="x-axis-label">Anzahl Interessenbereiche</div>
            </div>
          </div>
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container organizations_2" id="legalform_chart_container">
              <chart-header :title="charts.legalForm.title" :info="charts.legalForm.info" :chartid="charts.legalForm.id"></chart-header>
              <div class="chart-inner" id="legalform_chart"></div>
            </div>
          </div>
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container organizations_3" id="activity_chart_container">
              <chart-header :title="charts.activity.title" :info="charts.activity.info" :chartid="charts.activity.id"></chart-header>
              <div class="chart-inner" id="activity_chart"></div>
              <div class="x-axis-label">Anzahl Interessengruppen</div>
            </div>
          </div>
          <div class="col-md-8 chart-col">
            <div class="boxed-container chart-container organizations_4" id="financialexpense_chart_container">
              <chart-header :title="charts.financialExpense.title" :info="charts.financialExpense.info" :chartid="charts.financialExpense.id"></chart-header>
              <div class="chart-inner" id="financialexpense_chart"></div>
            </div>
          </div>
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container organizations_5" id="regulatoryprojects_chart_container">
              <chart-header :title="charts.regulatoryProjects.title" :info="charts.regulatoryProjects.info" :chartid="charts.regulatoryProjects.id"></chart-header>
              <div class="chart-inner" id="regprojects_chart"></div>
              <div class="x-axis-label">Anzahl Regelungsvorhaben</div>
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
                      <th class="header">FTE</th> 
                      <th class="header">Mitgliedschaften</th> 
                      <th class="header table-header-organisations-expense">Finanzielle Aufwendungen der Interessenvertretung</th> 
                      <th class="header">Regelungsvorhaben</th>
                      <th class="header">Geahndete Verstöße</th> 
                      <th class="header">Land</th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </div>
          <div class="last-update col-6">Letztes Update am: {{ cleanUpdateTimestamp(dataUpdateDate) }}</div>
          <div class="footer-link col-6"><a href="https://www.transparency.de/rechtliches/impressum" target="_blank">Impressum</a></div>
        </div>
      </div>
      <!-- Bottom bar -->
      <div class="container-fluid footer-bar">
        <div class="row">
          <div class="footer-col col-10 col-sm-10 footer-counts">
            <div class="dc-data-count count-box">
              <div class="filter-count">0</div>von <strong class="total-count">0</strong> Lobbyorganisationen
            </div>
            <div class="footer-input">
              <input type="text" id="search-input" placeholder="Nach Organisation filtern">
              <i class="material-icons">search</i>
            </div>
            <div class="footer-input footer-input-regprojects">
              <input type="text" id="search-input-regprojects" placeholder="Nach Gesetzen oder Drucksachen filtern">
              <i class="material-icons">search</i>
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
                    <div class="details-line"><span class="details-line-title">Rechtsform:</span> {{ selectedOrg.legalFormString }}</div>
                    <div class="details-line" v-if="selectedOrg.fois"><span class="details-line-title">Interessen- und Vorhabenbereiche:</span> {{ selectedOrg.fois.join(', ') }}</div>
                    <div class="details-line" v-if="selectedOrg.finExpCategoryFull && selectedOrg.finExpCategoryFull.length > 0"><span class="details-line-title">Jährliche finanzielle Aufwendungen:</span> {{ selectedOrg.finExpCategoryFull }}</div>
                    <div class="details-line" v-if="selectedOrg.employeeFTE"><span class="details-line-title">Vollzeitäquivalent der beschäftigten Personen im Bereich der Interessenvertretung:</span> {{ selectedOrg.employeeFTE }}</div>
                    <div class="details-line" v-if="selectedOrg.memberships"><span class="details-line-title">Mitgliedschaften:</span> {{ selectedOrg.memberships }}</div>
                    <div class="details-line" v-if="selectedOrg.fullData && selectedOrg.fullData.accountDetails && selectedOrg.fullData.accountDetails.lastUpdateDate"><span class="details-line-title">Aktualisiert am:</span> {{ cleanUpdateTimestamp(selectedOrg.fullData.accountDetails.lastUpdateDate) }}</div>
                    <div class="details-line" v-if="selectedOrg.registerNumber"><a :href="'https://www.lobbyregister.bundestag.de/suche/'+selectedOrg.registerNumber" target="_blank">Organisationsprofil anzeigen auf lobbyregister.bundestag.de</a></div>
                  </div>
                  <div class="col-md-12 regprojects-container-outer" v-if="selectedOrg.fullData && selectedOrg.fullData.regulatoryProjects && selectedOrg.fullData.regulatoryProjects.regulatoryProjects && selectedOrg.fullData.regulatoryProjects.regulatoryProjects.length > 0">
                    <div class="regprojects-section-title">Konkrete Regelungsvorhaben ({{selectedOrg.fullData.regulatoryProjects.regulatoryProjects.length}})</div>
                    <div class="regprojects-container" v-for="proj in selectedOrg.fullData.regulatoryProjects.regulatoryProjects">
                      <div class="regproject-title"><span v-if="proj.title">{{proj.title}}</span> <!--| <span v-if="proj.regulatoryProjectNumber">{{proj.regulatoryProjectNumber}}</span> --></div>
                      <div class="regproject-desc" v-if="proj.description">{{proj.description}}</div>
                      <!--Affected laws-->
                      <div class="regproject-subtitle" v-if="proj.affectedLaws && proj.affectedLaws.length > 0">Betroffenes geltendes Recht</div>
                      <ul class="regproject-laws" v-if="proj.affectedLaws && proj.affectedLaws.length > 0">
                        <li v-for="law in proj.affectedLaws">{{law.title}}</li>
                      </ul>
                      <!--Printed matters-->
                      <div class="regproject-subtitle" v-if="proj.printedMatters && proj.printedMatters.length > 0">Bundestags-Drucksachennummer</div>
                      <ul class="regproject-laws" v-if="proj.printedMatters && proj.printedMatters.length > 0">
                        <li v-for="matter in proj.printedMatters">
                          <a v-if="matter.documentUrl" :href="matter.documentUrl" target="_blank">
                            <span v-if="matter.printingNumber">{{matter.printingNumber}}</span>
                            <span v-if="matter.printingNumber && matter.title"> | </span>
                            <span v-if="matter.title">{{matter.title}}</span>
                          </a>
                          <span v-else>
                            <span v-if="matter.printingNumber">{{matter.printingNumber}}</span>
                            <span v-if="matter.printingNumber && matter.title"> | </span>
                            <span v-if="matter.title">{{matter.title}}</span>
                          </span>
                        </li>
                      </ul>
                      <!--Statements with recipients-->
                      <div class="regproject-subtitle" v-if="proj.statements && proj.statements.length > 0">Zur Stellungnahme</div>
                      <ul v-if="proj.statements && proj.statements.length > 0">
                        <li class="regproject-statements" v-for="statement in proj.statements">
                          <div v-if="statement.pdfUrl"><a :href="statement.pdfUrl" target="_blank">{{statement.pdfUrl}}</a></div>
                          <div class="regproject-recipients"><strong>Adressatenkreis:</strong> {{ getRecipients(statement) }}</div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Disclaimer modal -->
      <div class="modal" id="disclaimerModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="modal-title">Hinweis</div>
              <button type="button" class="close" data-dismiss="modal"><i class="material-icons">close</i></button>
            </div>
            <!-- Modal body -->
            <div class="modal-body">
              <div class="container">
                <div class="row">
                  <div class="col-md-12">
                    <p>Willkommen auf Integrity Watch!</p>
                    <p>Auf der Startseite finden Sie die täglich aktualisierten Daten des Lobbyregisters der Bundesregierung. Die Einträge entsprechen der aktuellen Gesetzeslage (BGBl. 2024 I Nr. 10).</p>
                    <p>Falls Sie Fragen oder Anregungen zu den Datensätzen haben oder diese herunterladen möchten, kontaktieren Sie uns <a href="mailto:office@transparency.de" class="modal-mail-link"><span class="material-icons modal-mail-icon">mail</span></a></p> 
                    <p class="modal-dataupdate-date">Letztes Update am: {{ cleanUpdateTimestamp(dataUpdateDate) }}</p>
                    <div class="modal-newsletter">
                      <div class="modal-newsletter-title">NEWSLETTER</div>
                      <div class="modal-newsletter-text">Bleiben Sie informiert und erhalten Sie regelmäßig wichtige Informationen zum Thema Korruption.</div>
                      <a class="modal-newsletter-link" href="https://www.transparency.de/aktuelles/newsletter" target="_blank">JETZT ABONNIEREN</a>
                    </div>
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
    <script type="text/javascript" src="vendor/js/html2canvas.min.js"></script>
    <script src="static/lobbyists.js?v=9"></script>

 
</body>
</html>