import type React from "react";
import styled from "styled-components";
import Chatbot from "./components/Chatbot";

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f6fa;
`;

const App: React.FC = () => {
	return (
		<AppContainer>
			<Chatbot />
		</AppContainer>
	);
};

export default App;
