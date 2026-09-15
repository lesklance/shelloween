document.addEventListener("DOMContentLoaded", () => {
  //layout stuff
  const pages = document.querySelectorAll(".page");
  const progressBar = document.getElementById("quiz-progress");
  let activePage = pages[0];

  const options = {
    root: document.querySelector(".scroll-container"),
    threshold: 0.5, 
  };

  const observerCallback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        activePage = entry.target;

        // prog percent
        const index = Array.from(pages).indexOf(entry.target);
        const percent = ((index) / (pages.length - 1)) * 100;
        progressBar.style.width = `${percent}%`;

        // freeze clock if game over
        if (index === pages.length - 1) {
          clearInterval(gameLoop);
        }
      } else {
        entry.target.classList.remove("visible");
      }
    });
  };


  const observer = new IntersectionObserver(observerCallback, options);
  pages.forEach((page) => observer.observe(page));

  // glitch stuff
  const glitchElements = document.querySelectorAll(".glitch-text");
  const chars = "XØ▕EJNVGJFJC█▄▀▚▞𝄢⧉⪡⪢0101XYZ$#!?%"; 

  glitchElements.forEach((glitchElement) => {
    const originalText = glitchElement.getAttribute("data-text");
    let scrambleInterval = null;
    let shadowInterval = null;

    glitchElement.addEventListener("mouseenter", () => {
      clearInterval(scrambleInterval);
      clearInterval(shadowInterval);

      scrambleInterval = setInterval(() => {
        glitchElement.innerText = originalText
          .split("")
          .map(() => chars[Math.floor(Math.random() * chars.length)])
          .join("");
      }, 300);

      shadowInterval = setInterval(() => {
        const x1 = (Math.random() * 8 - 4).toFixed(1);
        const y1 = (Math.random() * 6 - 3).toFixed(1);
        const x2 = (Math.random() * 8 - 4).toFixed(1);
        const y2 = (Math.random() * 6 - 3).toFixed(1);

        glitchElement.style.textShadow = `${x1}px ${y1}px 0 #ff003c, ${x2}px ${y2}px 0 #ff003c`;
      }, 100);
    });

    glitchElement.addEventListener("mouseleave", () => {
      clearInterval(scrambleInterval);
      clearInterval(shadowInterval);
      glitchElement.innerText = originalText;
      glitchElement.style.textShadow = "none";
    });
  });

  // game logic
  let score = 0;
  let timeLeft = 60; 
  const timerDisplay = document.getElementById("global-time");
  const scoreDisplay = document.getElementById("final-score");

  const gameLoop = setInterval(() => {
    // current page has fast, accelerate time drain
    if (activePage && activePage.getAttribute("data-speed") === "fast") {
      timeLeft -= 0.3;
    } else {
      timeLeft -= 0.02;
    }

    timerDisplay.innerText = Math.max(0, Math.ceil(timeLeft));

    if (timeLeft <= 0) {
      clearInterval(gameLoop);
      alert("Failed. Fools have no place here.");
      window.location.href = "failure.html"; 
    }
  }, 20);

  // choice stuff
  const optionButtons = document.querySelectorAll(".quiz-btn");
  optionButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const selected = e.target;
      const parentSection = selected.closest(".page");
      const currentSiblings = parentSection.querySelectorAll(".quiz-btn");
      const isCorrect = selected.getAttribute("data-correct") === "true";

      if (isCorrect) {
        selected.classList.add("correct-choice");
        score++;
        scoreDisplay.innerText = score;
      } else {
        selected.classList.add("wrong-choice");
        
        // deduct 10 secs if wrong answer
        timeLeft -= 10;
        if (timeLeft < 0) timeLeft = 0;
        timerDisplay.innerText = Math.ceil(timeLeft);

        // highlight correct
        currentSiblings.forEach(s => {
          if(s.getAttribute("data-correct") === "true") s.classList.add("correct-choice");
        });
      }

      // lock buttons
      currentSiblings.forEach(button => button.disabled = true);

      // scroll to next stuff
      setTimeout(() => {
        const nextSection = parentSection.nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: "smooth" });
        } else {
          clearInterval(gameLoop);
        }
      }, 1200);
    });
  });
});

// eye tracking
document.addEventListener('mousemove', (e) => {
  const container = document.querySelector('.eyes-container');
  const pupils = document.querySelector('.pupils-overlay');
  
  if (!container || !pupils) return;

  // find centre
  const rect = container.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // angle of cursor
  const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
  
  // max distance pupils can travel
  const maxDistance = 30; 
  
  // calc movement coords
  const moveX = Math.cos(angle) * maxDistance;
  const moveY = Math.sin(angle) * maxDistance;
  
  // use coords to move pupil layer
  pupils.style.transform = `translate(${moveX}px, ${moveY}px)`;
});
