import { useState } from "react";
import styled from "styled-components";

interface UserInfo {
	name: string;
	email: string;
	phone: string;
	jobTitle: string;
	motivation: string;
}

interface Message {
	type: "bot" | "user";
	content: string;
}

const ChatbotContainer = styled.div`
  width: 400px;
  height: 600px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const ChatHeader = styled.div`
  background: #2E7D32;
  color: white;
  padding: 15px;
  text-align: center;
  font-weight: bold;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #4CAF50, #81C784, #4CAF50);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #F5F9F5;
`;

const MessageBubble = styled.div<{ type: "bot" | "user" }>`
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 15px;
  background: ${(props) => (props.type === "bot" ? "#E8F5E9" : "#2E7D32")};
  color: ${(props) => (props.type === "bot" ? "#1B5E20" : "white")};
  align-self: ${(props) => (props.type === "bot" ? "flex-start" : "flex-end")};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  line-height: 1.4;
`;

const InputContainer = styled.div`
  padding: 15px;
  border-top: 1px solid #E8F5E9;
  display: flex;
  gap: 10px;
  background: white;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #C8E6C9;
  border-radius: 5px;
  outline: none;
  font-size: 14px;
  &:focus {
    border-color: #2E7D32;
    box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.1);
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  &:hover {
    background: #1B5E20;
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
`;

const OptionButton = styled.button`
  width: 100%;
  padding: 12px;
  margin: 5px 0;
  background: #E8F5E9;
  border: 1px solid #C8E6C9;
  border-radius: 5px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #1B5E20;
  line-height: 1.4;

  &:hover {
    background: #C8E6C9;
    border-color: #2E7D32;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 10px 0;
  padding: 5px;
`;

const Chatbot: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([
		{ type: "bot", content: "Hello! I'm Tej. What's your name?" },
	]);
	const [input, setInput] = useState("");
	const [userInfo, setUserInfo] = useState<UserInfo>({
		name: "",
		email: "",
		phone: "",
		jobTitle: "",
		motivation: "",
	});
	const [step, setStep] = useState<
		"name" | "email" | "phone" | "jobTitle" | "motivation"
	>("name");

	const jobTitles = [
		"Student",
		"ESG professional in a company",
		"Founder/CEO",
		"ESG enthusiast",
		"Others",
	];

	const motivations = [
		"I want to get a basic understanding of how ESG works in business",
		"My customer has given me an ESG related document to sign/fill",
		"I want to implement ESG/sustainability in my company and I dont know where to start",
		"I want to calculate my GHG Emissions",
		"None of the above",
	];

	const extractName = (text: string): string => {
		const nameRegex =
			/(?:my name is|i am|it's|you can call me)\s+([a-zA-Z]+(?: [a-zA-Z]+)?)/i;
		const match = text.match(nameRegex);
		return match ? match[1] : text.trim();
	};

	const handleOptionSelect = (option: string) => {
		const newMessage: Message = { type: "user", content: option };
		setMessages((prev) => [...prev, newMessage]);

		switch (step) {
			case "jobTitle":
				setUserInfo((prev) => ({ ...prev, jobTitle: option }));
				setMessages((prev) => [
					...prev,
					{
						type: "bot",
						content: "Which of these best describes you?",
					},
				]);
				setStep("motivation");
				break;
			case "motivation":
				setUserInfo((prev) => ({ ...prev, motivation: option }));
				const recommendation = generateRecommendation(
					userInfo.jobTitle,
					option,
				);
				setMessages((prev) => [
					...prev,
					{ type: "bot", content: recommendation },
				]);
				break;
		}
	};

	const isThankYouMessage = (message: string): boolean => {
		const thankYouPatterns = [
			/thank you/i,
			/thanks/i,
			/thank/i,
			/appreciate it/i,
			/much obliged/i,
		];
		return thankYouPatterns.some((pattern) => pattern.test(message));
	};

	const isValidEmail = (email: string): boolean => {
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		return emailRegex.test(email);
	};

	const isValidPhoneNumber = (phone: string): boolean => {
		// Remove any spaces, dashes, or parentheses for validation
		const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
		// Check if the cleaned number contains only digits and is between 7 and 15 digits
		return /^\d{7,15}$/.test(cleanPhone);
	};

	const handleSubmit = () => {
		if (!input.trim()) return;

		const newMessage: Message = { type: "user", content: input };
		setMessages((prev) => [...prev, newMessage]);

		// Check if this is a thank you message after recommendation
		if (step === "motivation" && isThankYouMessage(input)) {
			setMessages((prev) => [
				...prev,
				{
					type: "bot",
					content:
						"You're welcome! I'm here to help you on your sustainability journey. Feel free to reach out if you have any questions about ESG or sustainability. Together, we can make a difference! 🌱",
				},
			]);
			setInput("");
			return;
		}

		switch (step) {
			case "name":
				setUserInfo((prev) => ({ ...prev, name: extractName(input) }));
				setMessages((prev) => [
					...prev,
					{
						type: "bot",
						content: `Nice to meet you, ${extractName(input)}! What's your email address?`,
					},
				]);
				setStep("email");
				break;
			case "email":
				if (!isValidEmail(input)) {
					setMessages((prev) => [
						...prev,
						{
							type: "bot",
							content:
								"Please enter a valid email address (e.g., name@example.com)",
						},
					]);
					setInput("");
					return;
				}
				setUserInfo((prev) => ({ ...prev, email: input }));
				setMessages((prev) => [
					...prev,
					{ type: "bot", content: "Great! And what's your phone number?" },
				]);
				setStep("phone");
				break;
			case "phone":
				if (!isValidPhoneNumber(input)) {
					setMessages((prev) => [
						...prev,
						{
							type: "bot",
							content:
								"Please enter a valid phone number (7-15 digits, can include spaces, dashes, or parentheses)",
						},
					]);
					setInput("");
					return;
				}
				setUserInfo((prev) => ({ ...prev, phone: input }));
				setMessages((prev) => [
					...prev,
					{
						type: "bot",
						content: "What is your job title?",
					},
				]);
				setStep("jobTitle");
				break;
		}

		setInput("");
	};

	const generateRecommendation = (
		jobTitle: string,
		motivation: string,
	): string => {
		// Recommendation logic based on user profile and needs
		if (jobTitle === "Student" || jobTitle === "ESG enthusiast") {
			return `Based on your profile, I recommend our Training sessions that explain what sustainability is.`;
		}

		if (
			jobTitle === "ESG professional in a company" ||
			jobTitle === "Founder/CEO"
		) {
			if (
				motivation.includes(
					"I want to get a basic understanding of how ESG works in business",
				)
			) {
				return `Based on your needs, I recommend our Training sessions that explain what sustainability is.`;
			} else {
				return `Based on your needs, I recommend:
- ESG for business trainings - practical step by step process
- ESG report creation (calculations and words)
- ESG & Sustainability materiality assessment`;
			}
		}

		return `Based on your needs, I recommend our Training sessions that explain what sustainability is.`;
	};

	return (
		<ChatbotContainer>
			<ChatHeader>ESG & Sustainability Assistant</ChatHeader>
			<MessagesContainer>
				{messages.map((message, index) => (
					<MessageBubble key={index} type={message.type}>
						{message.content}
						{step === "jobTitle" &&
							message.type === "bot" &&
							message.content.includes("job title") && (
								<OptionsContainer>
									{jobTitles.map((title, index) => (
										<OptionButton
											key={index}
											onClick={() => handleOptionSelect(title)}
										>
											{title}
										</OptionButton>
									))}
								</OptionsContainer>
							)}
						{step === "motivation" &&
							message.type === "bot" &&
							message.content.includes("best describes you") && (
								<OptionsContainer>
									{motivations.map((motivation, index) => (
										<OptionButton
											key={index}
											onClick={() => handleOptionSelect(motivation)}
										>
											{motivation}
										</OptionButton>
									))}
								</OptionsContainer>
							)}
					</MessageBubble>
				))}
			</MessagesContainer>
			<InputContainer>
				<Input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type your message..."
					onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
				/>
				<Button onClick={handleSubmit}>Send</Button>
			</InputContainer>
		</ChatbotContainer>
	);
};

export default Chatbot;
